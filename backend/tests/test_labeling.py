"""labeling.py's prompt construction + response parsing, no network."""

from __future__ import annotations

from vektori_backend.diagnosis.labeling import LiteLLMLabeler, _build_prompt, _parse_labels
from vektori_backend.diagnosis.models import Label, Provenance
from vektori_backend.envgen.llm import LLMResponse
from vektori_backend.envgen.spec import LLMSpec

_PROV = Provenance(
    repo="acme/widgets",
    base_commit="deadbeef",
    pr_url="https://github.com/acme/widgets/pull/42",
    touched_files=["src/orm/soft_delete.py", "tests/test_soft_delete.py"],
)


def test_prompt_threads_provenance_and_capabilities():
    prompt = _build_prompt(
        "agent did X then Y", _PROV, ["soft_delete_convention", "api_client_sync"]
    )
    assert "acme/widgets" in prompt
    assert "deadbeef" in prompt
    assert "https://github.com/acme/widgets/pull/42" in prompt
    assert "src/orm/soft_delete.py" in prompt
    assert "soft_delete_convention" in prompt
    assert "api_client_sync" in prompt
    assert "agent did X then Y" in prompt


def test_parse_labels_reads_json_object_from_response():
    raw = 'Some preamble.\n{"a": "LACKING", "b": "PRESENT"}\ntrailing text'
    labels = _parse_labels(raw, ["a", "b", "c"])
    assert labels == {"a": Label.LACKING, "b": Label.PRESENT, "c": Label.NA}


def test_parse_labels_rejects_junk_value_as_na():
    raw = '{"a": "MAYBE"}'
    labels = _parse_labels(raw, ["a"])
    assert labels["a"] == Label.NA


def test_parse_labels_raises_on_no_json():
    import pytest

    with pytest.raises(ValueError):
        _parse_labels("no json here at all", ["a"])


class _FakeComplete:
    """Stands in for envgen.llm.complete() — records the call, returns a scripted response."""

    def __init__(self, content: str):
        self.content = content
        self.calls: list[dict] = []

    def __call__(self, spec, **kwargs):
        self.calls.append({"spec": spec, **kwargs})
        return LLMResponse(content=self.content)


def test_litellm_labeler_calls_complete_and_returns_capability_labels(monkeypatch):
    fake = _FakeComplete('{"soft_delete_convention": "LACKING"}')
    monkeypatch.setattr("vektori_backend.diagnosis.labeling.complete", fake)

    labeler = LiteLLMLabeler(LLMSpec(provider="anthropic", model="claude-sonnet-4-6"))
    labels = labeler.label(
        "traj-1", "the agent hard-deleted the row", _PROV, ["soft_delete_convention"]
    )

    assert len(fake.calls) == 1
    assert fake.calls[0]["spec"].provider == "anthropic"
    assert len(labels) == 1
    assert labels[0].trajectory_id == "traj-1"
    assert labels[0].capability == "soft_delete_convention"
    assert labels[0].label == Label.LACKING
