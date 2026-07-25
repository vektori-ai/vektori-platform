#!/bin/bash
set -uxo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd /workspace
git config --global --add safe.directory /workspace
mkdir -p /logs/verifier
git checkout 8e36f2bc685dfbe43cd7503bc1c422a6ed6e05a5 -- tests/client/test_auth.py tests/models/test_requests.py tests/models/test_responses.py tests/models/test_whatwg.py tests/test_content.py tests/test_main.py || true
git apply --verbose --reject - <<'EOF_R2E_TEST_PATCH'
diff --git a/tests/client/test_auth.py b/tests/client/test_auth.py
index 5776fc33ba..b3aeaf4e4b 100644
--- a/tests/client/test_auth.py
+++ b/tests/client/test_auth.py
@@ -743,7 +743,7 @@ async def test_async_auth_reads_response_body() -> None:
         response = await client.get(url, auth=auth)
 
     assert response.status_code == 200
-    assert response.json() == {"auth": '{"auth": "xyz"}'}
+    assert response.json() == {"auth": '{"auth":"xyz"}'}
 
 
 def test_sync_auth_reads_response_body() -> None:
@@ -759,7 +759,7 @@ def test_sync_auth_reads_response_body() -> None:
         response = client.get(url, auth=auth)
 
     assert response.status_code == 200
-    assert response.json() == {"auth": '{"auth": "xyz"}'}
+    assert response.json() == {"auth": '{"auth":"xyz"}'}
 
 
 @pytest.mark.anyio
diff --git a/tests/models/test_requests.py b/tests/models/test_requests.py
index ad6d6705f2..d2a458d57e 100644
--- a/tests/models/test_requests.py
+++ b/tests/models/test_requests.py
@@ -62,7 +62,7 @@ def test_json_encoded_data():
     request.read()
 
     assert request.headers["Content-Type"] == "application/json"
-    assert request.content == b'{"test": 123}'
+    assert request.content == b'{"test":123}'
 
 
 def test_headers():
@@ -71,7 +71,7 @@ def test_headers():
     assert request.headers == {
         "Host": "example.org",
         "Content-Type": "application/json",
-        "Content-Length": "13",
+        "Content-Length": "12",
     }
 
 
@@ -183,12 +183,12 @@ def test_request_picklable():
     assert pickle_request.method == "POST"
     assert pickle_request.url.path == "/"
     assert pickle_request.headers["Content-Type"] == "application/json"
-    assert pickle_request.content == b'{"test": 123}'
+    assert pickle_request.content == b'{"test":123}'
     assert pickle_request.stream is not None
     assert request.headers == {
         "Host": "example.org",
         "Content-Type": "application/json",
-        "content-length": "13",
+        "content-length": "12",
     }
 
 
diff --git a/tests/models/test_responses.py b/tests/models/test_responses.py
index d639625825..06c28e1e30 100644
--- a/tests/models/test_responses.py
+++ b/tests/models/test_responses.py
@@ -81,9 +81,9 @@ def test_response_json():
 
     assert response.status_code == 200
     assert response.reason_phrase == "OK"
-    assert response.json() == {"hello": "world"}
+    assert str(response.json()) == "{'hello': 'world'}"
     assert response.headers == {
-        "Content-Length": "18",
+        "Content-Length": "17",
         "Content-Type": "application/json",
     }
 
diff --git a/tests/models/test_whatwg.py b/tests/models/test_whatwg.py
index 6e00a921ae..14af682586 100644
--- a/tests/models/test_whatwg.py
+++ b/tests/models/test_whatwg.py
@@ -10,7 +10,7 @@
 
 # URL test cases from...
 # https://github.com/web-platform-tests/wpt/blob/master/url/resources/urltestdata.json
-with open("tests/models/whatwg.json", "r") as input:
+with open("tests/models/whatwg.json", "r", encoding="utf-8") as input:
     test_cases = json.load(input)
     test_cases = [
         item
diff --git a/tests/test_content.py b/tests/test_content.py
index 21c92dd799..053f52eac4 100644
--- a/tests/test_content.py
+++ b/tests/test_content.py
@@ -4,6 +4,7 @@
 import pytest
 
 import httpx
+from httpx._content import encode_json
 
 method = "POST"
 url = "https://www.example.com"
@@ -173,11 +174,11 @@ async def test_json_content():
 
     assert request.headers == {
         "Host": "www.example.com",
-        "Content-Length": "19",
+        "Content-Length": "18",
         "Content-Type": "application/json",
     }
-    assert sync_content == b'{"Hello": "world!"}'
-    assert async_content == b'{"Hello": "world!"}'
+    assert sync_content == b'{"Hello":"world!"}'
+    assert async_content == b'{"Hello":"world!"}'
 
 
 @pytest.mark.anyio
@@ -484,3 +485,39 @@ async def hello_world() -> typing.AsyncIterator[bytes]:
 def test_response_invalid_argument():
     with pytest.raises(TypeError):
         httpx.Response(200, content=123)  # type: ignore
+
+
+def test_ensure_ascii_false_with_french_characters():
+    data = {"greeting": "Bonjour, ça va ?"}
+    headers, byte_stream = encode_json(data)
+    json_output = b"".join(byte_stream).decode("utf-8")
+
+    assert (
+        "ça va" in json_output
+    ), "ensure_ascii=False should preserve French accented characters"
+    assert headers["Content-Type"] == "application/json"
+
+
+def test_separators_for_compact_json():
+    data = {"clé": "valeur", "liste": [1, 2, 3]}
+    headers, byte_stream = encode_json(data)
+    json_output = b"".join(byte_stream).decode("utf-8")
+
+    assert (
+        json_output == '{"clé":"valeur","liste":[1,2,3]}'
+    ), "separators=(',', ':') should produce a compact representation"
+    assert headers["Content-Type"] == "application/json"
+
+
+def test_allow_nan_false():
+    data_with_nan = {"nombre": float("nan")}
+    data_with_inf = {"nombre": float("inf")}
+
+    with pytest.raises(
+        ValueError, match="Out of range float values are not JSON compliant"
+    ):
+        encode_json(data_with_nan)
+    with pytest.raises(
+        ValueError, match="Out of range float values are not JSON compliant"
+    ):
+        encode_json(data_with_inf)
diff --git a/tests/test_main.py b/tests/test_main.py
index feb796e155..b1a77d485b 100644
--- a/tests/test_main.py
+++ b/tests/test_main.py
@@ -114,7 +114,7 @@ def test_post(server):
         "content-type: text/plain",
         "Transfer-Encoding: chunked",
         "",
-        '{"hello": "world"}',
+        '{"hello":"world"}',
     ]
 
 

EOF_R2E_TEST_PATCH
R2E_APPLY_RC=$?
if [ "$R2E_APPLY_RC" -ne 0 ]; then
  echo "0.000000" > /logs/verifier/reward.txt
  printf '%s' '{"reward": 0.0, "resolved": false, "parse_status": "test_patch_apply_failed"}' > /logs/verifier/reward.json
  echo "R2E: test_patch failed to apply (rc=$R2E_APPLY_RC) — failing closed" >&2
  exit 0
fi
( cd /workspace && python -m pytest -v tests/client/test_auth.py tests/models/test_requests.py tests/models/test_responses.py tests/models/test_whatwg.py tests/test_content.py tests/test_main.py ) > /logs/verifier/test_output.log 2>&1
TEST_EXIT_CODE=$?
cat /logs/verifier/test_output.log
python3 "$SCRIPT_DIR/verifier.py" --log /logs/verifier/test_output.log --f2p "$SCRIPT_DIR/f2p.json" --p2p "$SCRIPT_DIR/p2p.json" --test-cmds 'cd /workspace python -m pytest -v tests/client/test_auth.py tests/models/test_requests.py tests/models/test_responses.py tests/models/test_whatwg.py tests/test_content.py tests/test_main.py' --exit-code "$TEST_EXIT_CODE" --out-dir /logs/verifier || { [ "$TEST_EXIT_CODE" -eq 0 ] && echo "1.0" > /logs/verifier/reward.txt || echo "0.0" > /logs/verifier/reward.txt; }
git checkout 8e36f2bc685dfbe43cd7503bc1c422a6ed6e05a5 -- tests/client/test_auth.py tests/models/test_requests.py tests/models/test_responses.py tests/models/test_whatwg.py tests/test_content.py tests/test_main.py || true
exit 0
