---
layout: post
title: "CPU-Only LLM Inference Explained: Quantization, GGUF, and llama.cpp"
date: 2025-12-28
categories: [DevOps, AI, LLMs, Machine Learning]
tags: [LLMs, CPU inference, quantization, llama.cpp, large language models, AI, machine learning]
description: "A comprehensive guide to running large language models (LLMs) entirely on CPU hardware using quantization techniques and efficient runtimes like llama.cpp."
keywords: [LLMs, CPU inference, quantization, llama.cpp, large language models, AI, machine learning]
---

# Running Large Language Models on CPU: A Practical Guide to CPU-Only LLM Inference

> *No GPUs. No cloud scaling. Just Linux, CPUs, and solid systems engineering.*

Large Language Models (LLMs) are often associated with expensive GPUs and cloud infrastructure. However, for **development, research, privacy-sensitive environments, and cost-controlled setups**, running LLMs **entirely on CPU** is not only possible — it’s practical.

This post is a **complete, end-to-end guide** to running **large models (13B–27B+) on CPU-only hardware**, using modern quantization techniques and efficient runtimes like `llama.cpp`.

By the end, you’ll understand:
- Why CPU-based LLMs exist
- What *quantization* and *inference* really mean
- How to set up a Linux system for CPU inference
- How large models can realistically run without GPUs
- A reproducible workflow you can use immediately

---

## Why Run LLMs on CPU?

Let’s address the obvious question first.

### If GPUs are faster, why bother with CPU?

Because **speed is not the only constraint**.

CPU-based LLMs are ideal when you need:

- **Low-cost experimentation** (no $10K GPUs)
- **Offline or air-gapped environments**
- **Privacy & compliance** (healthcare, finance, legal)
- **On-prem developer tooling**
- **Edge or internal R&D systems**
- **Predictable, reproducible environments**

For many teams, **“fast enough” beats “fastest possible.”**

---

## Core Concepts (No ML Background Required)

### 1. What Is Inference?

**Inference** is the act of *using* a trained model to generate text.

- Training = learning weights (expensive, GPU-heavy)
- Inference = reading weights + predicting tokens (much cheaper)

This guide is **only about inference**.

---

### 2. Why Large Models Don’t Fit on CPU (By Default)

A 27B model in FP16 format:
- 27B parameters × 2 bytes ≈ 54 GB RAM


That’s before runtime overhead.

This is why **quantization** exists.

---

## Quantization Explained (Simply)

### What Is Quantization?

Quantization reduces the **precision** of model weights to save memory and speed up inference.

| Format | Memory | Quality | Use Case |
|------|-------|--------|---------|
| FP16 | Very High | Best | Training / GPUs |
| Q6 | Medium | Very Good | CPU, high quality |
| Q5 | Lower | Good | CPU, balanced |
| Q4 | Lowest | Acceptable | CPU, fastest |

Quantization:
- Reduces RAM usage by **4–6×**
- Improves CPU cache efficiency
- Makes CPU inference viable

---

## Why GGUF Format?

Modern CPU runtimes use **GGUF**, a binary format that:

- Packs weights + tokenizer together
- Is optimized for memory-mapped loading
- Avoids Python overhead
- Works directly with C/C++ inference engines

Think of GGUF as:
> *“Docker images for LLM weights.”*

---

## The CPU Inference Stack

Here’s the **minimal, production-grade stack**:

```
Raw Model Weights (HF / Google)
↓
Conversion → GGUF
↓
Quantization (Q4/Q5/Q6)
↓
CPU Runtime (llama.cpp)
↓
Optimized Linux Execution
```


No PyTorch runtime is needed at inference time.

---

## System Requirements (Realistic)

### Minimum Recommended Specs

- Ubuntu 22.04+
- x86_64 CPU with **AVX2** (AVX512 preferred)
- **128 GB RAM** for 27B models
- 16–32 CPU cores
- SSD storage

> Tip: CPUs with high memory bandwidth matter more than clock speed.

---

## Step-by-Step Quick Start

### 1. Install System Dependencies

```bash
sudo apt update && sudo apt install -y \
  build-essential cmake git wget \
  python3 python3-venv python3-pip \
  numactl htop perf libopenblas-dev
```

### 2. Build the CPU Inference Engine

llama.cpp is the gold standard for CPU LLM inference.

```
git clone https://github.com/ggerganov/llama.cpp.git
cd llama.cpp
make LLAMA_AVX2=1 LLAMA_AVX512=1 LLAMA_BLAS=1 -j$(nproc)
```

Verify CPU features:

```
lscpu | grep AVX
```

### 3. Download Model Weights

Download official model weights (example shown):

```
mkdir -p models/raw
cd models/raw
wget <official-model-url>
```

Always respect model licenses.

### 4. Convert to GGUF
```
python llama.cpp/tools/convert-hf-to-gguf.py \
  models/raw/model.safetensors \
  models/gguf/model.gguf
```

This step:

- Aligns tokenizer
- Normalizes weight layout
- Ensures runtime compatibility

### 5. Quantize the Model

```
./quantize models/gguf/model.gguf models/quantized/model-q4.gguf q4_k_m
./quantize models/gguf/model.gguf models/quantized/model-q5.gguf q5_k_m
./quantize models/gguf/model.gguf models/quantized/model-q6.gguf q6_k
```

Start with Q4. Move up if quality is insufficient.

### 6. Run Inference (Optimized)

```
numactl --cpunodebind=0 --membind=0 \
./main -m models/quantized/model-q4.gguf \
--threads 16 \
-p "Explain CPU-based LLM inference"
```

Tune:

- --threads

- NUMA binding

- Batch size

- Performance Expectations (Honest)

For a 27B model on CPU:

| Quantization | Tokens/sec |
|---|---|
| Q4 | 4–7 t/s |
| Q5 | 3–5 t/s |
| Q6 | 2–4 t/s |

This is not chatGPT speed — but it is:

- Stable

- Cheap

- Private

- Predictable

## Common Pitfalls
❌ Tokenizer mismatch

- Always convert with the correct tokenizer.

❌ Running out of memory

- Use lower quantization or fewer threads.

❌ Poor performance

Check:

- AVX support

- NUMA locality

- BLAS enabled

## Final Thoughts

CPU-based LLM inference is not a workaround — it’s a legitimate engineering choice.

With the right:

- Quantization
- Runtime
- Linux tuning
- Documentation

You can run surprisingly large models on commodity hardware.

And most importantly — you understand exactly how it works.

## Further Reading

- llama.cpp GitHub
- GGUF specification
- CPU vectorization (AVX2 / AVX512)
- NUMA performance tuning