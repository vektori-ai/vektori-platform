# Design notes

## Identifying deficits

For every rollout, an analysis agent labels each capability $c$ per trajectory $i$ as whether
it was needed and, if so, whether the agent actually used it.

Dataset of $N$ attempts, each a task, trajectory, reward, and outcome ($y_i \in \{0,1\}$):

$$
D = \{ (x_i, \tau_i, r_i, y_i) \}_{i=1}^{N}
$$

Per-trajectory label for capability $c$ — `LACKING` means it was needed but not exercised:

$$
\ell_i^c \in \{\, \text{NA},\ \text{PRESENT},\ \text{LACKING} \,\}
$$

**Noise floor** — among *wins* where $c$ was relevant, how often it was still missing:

$$
ER^{+}(c) = \frac{\sum_i \mathbb{1}[\ell_i^c = \text{LACKING} \ \wedge\ y_i = 1]}{\sum_i \mathbb{1}[\ell_i^c \neq \text{NA} \ \wedge\ y_i = 1]}
$$

**Failure rate** — among *losses* where $c$ was relevant, how often it was missing:

$$
ER^{-}(c) = \frac{\sum_i \mathbb{1}[\ell_i^c = \text{LACKING} \ \wedge\ y_i = 0]}{\sum_i \mathbb{1}[\ell_i^c \neq \text{NA} \ \wedge\ y_i = 0]}
$$

**Contrastive gap** — high $\Delta$ means $c$'s absence actually causes failure, not incidental:

$$
\Delta(c) = ER^{-}(c) - ER^{+}(c)
$$

**Coverage** — of *all* failures (not just the ones where $c$ was relevant), the share this
deficit touches:

$$
Cov(c) = \frac{1}{|D^{-}|} \sum_i \mathbb{1}[\ell_i^c = \text{LACKING} \ \wedge\ y_i = 0]
$$

$\Delta(c)$ says whether a deficit is causal, $Cov(c)$ says how much of the failure surface it
explains — together they rank which deficits are worth a LoRA adapter.

## Generating synthetic RL environments

Once a deficit is identified, each task instance where it showed up is turned into a task
package: the original state, the tools available, and an executable rubric graded against
what actually happened in the real trace — so the synthetic environment mirrors the real one
instead of a hand-built approximation of it.

## Training

One LoRA adapter per capability deficit, not a full retrain — so fixing a gap never touches,
and can't regress, what the base model already does well. A router picks the right adapter(s)
at inference time.
