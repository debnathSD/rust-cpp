// The roadmap itself. Durations are in weeks at the 10 h/week baseline.
// Item ids are positional (phase-section-index): append new items to the end of a list
// so progress people have already saved stays attached to the right item.

export const TRACKS = { rust: "Rust", cpp: "C++", ai: "Edge AI", emb: "Embedded" };

export const PHASES = [
  {
    id: "p0", n: 0, name: "Set up the workshop", short: "Setup", weeks: 1, tracks: ["rust"],
    why: "One evening of setup so every later hour goes into Rust, not tooling. On a Mac, Apple's `clang++` is already there; Rust and CMake aren't.",
    learn: [
      "Install Rust with rustup, then add `clippy`, `rustfmt` and `rust-src`",
      "Install CMake with Homebrew; you'll need it in Phase 4",
      "VS Code with rust-analyzer, or RustRover; run clippy on save",
      "Install `bacon`, `cargo-nextest` and `cargo-expand`",
      "Create one `rust-journey` repo for every exercise and project (edition 2024)",
      "Start `LEARNING.md`: one line per session on what confused you and what fixed it"
    ],
    read: [
      { t: "rustup.rs", u: "https://rustup.rs", note: "the official installer" },
      { t: "The Rust Programming Language, ch. 1", u: "https://doc.rust-lang.org/book/", note: "known as “the Book”; free" }
    ],
    checks: [
      { n: "toolchain_works", t: "`cargo new hello`, then `cd hello` and `cargo run`, prints Hello, world!" },
      { n: "clippy_clean", t: "`cargo clippy` finishes with zero warnings" }
    ]
  },
  {
    id: "p1", n: 1, name: "Ownership mindset", short: "Foundations", weeks: 6, tracks: ["rust"], diag: true,
    why: "Everything in Rust hangs on ownership and borrowing. You already ship TypeScript, so skim the general programming parts and spend that time with the borrow checker until it feels like a code reviewer rather than an obstacle.",
    learn: [
      "Ownership and moves; `Copy` vs `Clone`",
      "Borrowing: many `&T` or one `&mut T`, never both at once",
      "`String` vs `&str`, and slices",
      "Structs, enums, `match` and `Option`",
      "Errors with `Result` and the `?` operator",
      "Traits and generics, first pass",
      "Lifetimes, first pass: what `'a` actually promises",
      "`Vec`, `HashMap`, iterators and closures",
      "Modules, crates and Cargo",
      "Unit, integration and doc tests"
    ],
    read: [
      { t: "The Book, ch. 1–13", u: "https://doc.rust-lang.org/book/", note: "weeks 1–4 of this phase" },
      { t: "The Book, remaining chapters", u: "https://doc.rust-lang.org/book/", note: "weeks 5–6; skim the final web-server project" },
      { t: "Rustlings", u: "https://rustlings.rust-lang.org", note: "do the matching exercises after each chapter" },
      { t: "Exercism Rust track", u: "https://exercism.org/tracks/rust", note: "25 exercises; request mentor feedback on 5" },
      { t: "Rust by Example", u: "https://doc.rust-lang.org/rust-by-example/", note: "for lookup, not cover to cover" }
    ],
    build: {
      name: "logscan", desc: "A log analyzer that streams a multi-gigabyte file in constant memory. Your first low-memory program.",
      steps: [
        "Start from the Book's `minigrep` chapter",
        "Stream with `BufReader`; never load the whole file",
        "Add `clap` arguments, regex filters and counts per log level",
        "Generate a 2 GB test log and measure peak memory with `/usr/bin/time -l`",
        "Tests for every parsing function; clippy clean"
      ]
    },
    checks: [
      { n: "fix_borrow_errors_unaided", t: "Fix a borrow-checker error from the compiler message alone, without searching" },
      { n: "explain_moves", t: "Explain why `let b = a;` invalidates a `String` but not an `i32`" },
      { n: "constant_memory", t: "logscan stays under 20 MB of memory on the 2 GB file" }
    ]
  },
  {
    id: "p2", n: 2, name: "Idiomatic Rust", short: "Idioms", weeks: 6, tracks: ["rust"],
    why: "Move from code that compiles to code an experienced Rust developer would approve: the right abstraction, typed errors, and performance you measured instead of assumed.",
    learn: [
      "`Box`, `Rc`, `Weak`, `Cell`, `RefCell`: when each one is right",
      "Generics (monomorphized) vs `dyn Trait` (vtable), and what each costs",
      "Lifetimes in structs; the elision rules",
      "Conversion traits: `From`, `TryFrom`, `AsRef`, `Deref`, `Display`",
      "Error design: `thiserror` for libraries, `anyhow` for applications",
      "Implementing `Iterator`; adapter chains that still read well",
      "`serde` for config and data files",
      "Newtype, builder and typestate patterns",
      "Workspaces, feature flags and rustdoc",
      "`macro_rules!` basics"
    ],
    read: [
      { t: "Effective Rust", u: "https://effective-rust.com", note: "David Drysdale; free online" },
      { t: "Programming Rust, 2nd ed.", u: "https://www.oreilly.com/library/view/programming-rust-2nd/9781492052586/", book: true, note: "Blandy, Orendorff, Tindall; the traits, iterators and collections chapters" },
      { t: "Learn Rust With Entirely Too Many Linked Lists", u: "https://rust-unofficial.github.io/too-many-lists/", note: "forces you through `Box`, `Rc` and a first taste of unsafe" },
      { t: "Crust of Rust", u: "https://www.youtube.com/@jonhoo", note: "Jon Gjengset's videos on lifetimes, iterators, smart pointers" }
    ],
    build: {
      name: "tensorlite", desc: "Your own N-dimensional tensor crate. You'll make it fast in Phase 3 and quantize it in Phase 5.",
      steps: [
        "Shape and strides; views that don't copy",
        "Indexing, reshape, transpose and broadcasting",
        "Elementwise ops through the `Add` and `Mul` traits",
        "Naive matmul, tested against hand-checked results",
        "`proptest` for the broadcasting rules; `criterion` benchmarks",
        "A README good enough that a stranger can use the crate from it alone"
      ]
    },
    checks: [
      { n: "choose_dyn_or_generic", t: "Say when you'd choose `impl Trait` over `&dyn Trait`, and what each costs" },
      { n: "no_unwrap_outside_tests", t: "tensorlite has no `unwrap()` outside tests; every error is typed" },
      { n: "clippy_pedantic", t: "`clippy::pedantic` passes, or each `allow` has a written reason" }
    ]
  },
  {
    id: "p3", n: 3, name: "Systems & performance", short: "Systems", weeks: 10, tracks: ["rust"],
    why: "This is where Rust pays off for low-memory work. You control layout, allocation and threads, and the compiler checks your threading for you. Apple silicon Macs and the Raspberry Pi 5 are both ARM, so the NEON SIMD you learn here carries straight over.",
    learn: [
      "`Send` and `Sync`: what the compiler is actually proving",
      "Threads, scoped threads, channels, `Arc<Mutex<T>>`, `RwLock`",
      "Atomics and memory ordering: `Relaxed`, `Acquire`/`Release`, `SeqCst`",
      "`rayon` for data parallelism",
      "`async`/`await`, `Pin` and Tokio: where async helps and where it doesn't",
      "Memory layout: `size_of`, alignment, `#[repr(C)]`, niche optimization",
      "Counting allocations; arenas (`bumpalo`), `SmallVec`, memory-mapped files",
      "Cache lines, false sharing and loop tiling",
      "SIMD: auto-vectorization first, then NEON through `std::arch`",
      "`unsafe`: raw pointers, invariants, `// SAFETY:` comments",
      "Checking unsafe code with Miri and concurrent code with `loom`"
    ],
    read: [
      { t: "Rust Atomics and Locks", u: "https://marabos.nl/atomics/", note: "Mara Bos; free online; read all of it" },
      { t: "Rust for Rustaceans", u: "https://nostarch.com/rust-rustaceans", book: true, note: "Jon Gjengset; you'll reread the unsafe, concurrency, FFI and no_std chapters" },
      { t: "The Rust Performance Book", u: "https://nnethercote.github.io/perf-book/", note: "Nicholas Nethercote" },
      { t: "The Rustonomicon", u: "https://doc.rust-lang.org/nomicon/", note: "ownership, uninitialized memory, concurrency" },
      { t: "Tokio tutorial", u: "https://tokio.rs/tokio/tutorial", note: "enough async to read real codebases" }
    ],
    build: {
      name: "tensorlite, fast", desc: "Make your matmul fast one step at a time, then build two small pieces you'll reuse on the robot.",
      steps: [
        "Matmul: naive → cache-tiled → `rayon` → NEON; chart GFLOP/s for each step in the README",
        "Profile with `samply` or `cargo flamegraph` and explain every speedup",
        "A lock-free single-producer, single-consumer ring buffer for sensor samples, tested with `loom` and Miri",
        "Process a 1 GB weights file in fixed-size windows under 50 MB of resident memory, and explain what `mmap` does to that number"
      ]
    },
    checks: [
      { n: "explain_speedups", t: "Explain each matmul speedup in terms of cache, vector width and threads" },
      { n: "miri_clean", t: "Miri passes on every `unsafe` block you wrote" },
      { n: "orderings_justified", t: "Every atomic ordering in the ring buffer has a written justification" }
    ]
  },
  {
    id: "p4", n: 4, name: "C++ and interop", short: "C++ & FFI", weeks: 8, tracks: ["cpp", "rust"],
    why: "Most edge AI engines and robot drivers are C++, so you need to read it, write it and wrap it. It goes faster after Rust: RAII is `Drop`, `unique_ptr` is `Box`, `shared_ptr` is `Arc`. The difference is that C++ won't stop you misusing them. From here on, keep one hour a week for reading llama.cpp or ggml source.",
    learn: [
      { tag: "cpp", t: "The compile and link model: headers, translation units, the one-definition rule" },
      { tag: "cpp", t: "CMake for real projects" },
      { tag: "cpp", t: "RAII and the rules of zero, three and five" },
      { tag: "cpp", t: "References and const correctness" },
      { tag: "cpp", t: "`unique_ptr`, `shared_ptr` and move semantics (`std::move` moves nothing by itself)" },
      { tag: "cpp", t: "Templates and C++20 concepts" },
      { tag: "cpp", t: "STL containers and algorithms; the lifetime traps in `span` and `string_view`" },
      { tag: "cpp", t: "Undefined behavior, caught with ASan, UBSan and TSan" },
      { tag: "ffi", t: "The C ABI: `extern \"C\"`, `#[repr(C)]`, and who frees what" },
      { tag: "ffi", t: "Panics must never unwind across an FFI boundary" },
      { tag: "ffi", t: "`bindgen` (C headers → Rust) and `cbindgen` (Rust → C headers)" },
      { tag: "ffi", t: "`cxx` for safe C++ ↔ Rust bridges; `autocxx` for larger APIs" },
      { tag: "ffi", t: "`build.rs` with the `cc` and `cmake` crates; static vs dynamic linking" }
    ],
    read: [
      { t: "A Tour of C++, 3rd ed.", u: "https://www.stroustrup.com/tour3.html", book: true, note: "Bjarne Stroustrup; short and modern" },
      { t: "learncpp.com", u: "https://www.learncpp.com", note: "to fill any gaps" },
      { t: "Effective Modern C++", u: "https://www.oreilly.com/library/view/effective-modern-c/9781491908419/", book: true, note: "Scott Meyers; move semantics, smart pointers, lambdas" },
      { t: "C++ Core Guidelines", u: "https://isocpp.github.io/CppCoreGuidelines/", note: "reference, not reading" },
      { t: "The cxx book", u: "https://cxx.rs", note: "plus the bindgen user guide" }
    ],
    build: {
      name: "llama-sys", desc: "Bridge Rust to llama.cpp yourself instead of reaching for a ready-made crate.",
      steps: [
        "Rewrite logscan in C++20; compare speed, binary size and what the sanitizers catch",
        "Build llama.cpp with CMake and run a small GGUF model from its command line",
        "Write your own `llama-sys` crate with `bindgen` against `llama.h`",
        "Wrap it safely: `Drop` for model and context handles, no raw pointers in the public API",
        "Generate text from Rust; compare your wrapper with the existing `llama-cpp-2` crate",
        "Wrap one small C++ class of your own (a Kalman filter is a good one) with `cxx`"
      ]
    },
    checks: [
      { n: "asan_clean", t: "The Rust + C++ binary runs clean under AddressSanitizer" },
      { n: "ownership_documented", t: "Every pointer that crosses the boundary has a documented owner" },
      { n: "read_a_ggml_kernel", t: "You can read and explain one ggml compute kernel" }
    ]
  },
  {
    id: "p5", n: 5, name: "Edge AI in Rust", short: "Edge AI", weeks: 10, tracks: ["ai", "rust"],
    why: "Running models on small devices is mostly memory arithmetic: bits per weight, KV-cache size, and how fast RAM can feed the cores. Learn the arithmetic first, then the frameworks.",
    learn: [
      "Transformer inference: tokens, attention and the KV cache",
      "Memory math: parameters × bits ÷ 8, plus KV cache, plus activations",
      "Quantization: absmax and zero-point, per-block scales, Q8_0, Q4_0 and k-quants",
      "File formats: safetensors, GGUF and ONNX",
      "Candle: tensors, devices (CPU, Metal, CUDA) and quantized models",
      "Burn for training and running small custom models",
      "`ort` (ONNX Runtime) and `tract` for exported vision and audio models",
      "WebAssembly: the `wasm32` target, `wasm-bindgen`, shrinking binaries",
      "Low-bandwidth delivery: chunked, resumable, compressed (`zstd`) and hashed (`blake3`) updates"
    ],
    read: [
      { t: "nanoGPT and “Let's build GPT”", u: "https://github.com/karpathy/nanoGPT", note: "Andrej Karpathy; the clearest path to how a transformer runs" },
      { t: "Candle", u: "https://github.com/huggingface/candle", note: "Hugging Face; start with the quantized model examples" },
      { t: "GGUF format spec", u: "https://github.com/ggml-org/ggml/blob/master/docs/gguf.md", note: "how quantized weights sit on disk" },
      { t: "Burn", u: "https://burn.dev", note: "the Burn Book and examples" },
      { t: "min-sized-rust", u: "https://github.com/johnthagen/min-sized-rust", note: "every trick for smaller binaries" }
    ],
    build: {
      name: "tinychat", desc: "An offline chat assistant that you measure as carefully as you build.",
      steps: [
        "Add Q8_0 and Q4_0 block quantization to tensorlite; measure error against size on real weights",
        "tinychat: a command-line chat on Candle with a quantized model under 2B parameters, using Metal on your Mac",
        "Predict its RAM footprint before loading, then measure it",
        "Run the same program on a Raspberry Pi 5; log tokens per second, time to first token and peak memory",
        "Compile a small model (Whisper tiny or an image classifier) to WASM; log the binary size after each optimization",
        "A model-update protocol: weight deltas in resumable zstd chunks over a throttled link (macOS Network Link Conditioner)"
      ]
    },
    checks: [
      { n: "predict_ram", t: "Your RAM prediction lands within 15% of the measurement" },
      { n: "explain_token_time", t: "You can say where the time goes in one generated token" },
      { n: "pi_offline", t: "tinychat runs fully offline on the Pi 5" }
    ]
  },
  {
    id: "p6", n: 6, name: "Embedded & robotics", short: "Embedded", weeks: 10, tracks: ["emb", "rust"],
    why: "`no_std` Rust runs on microcontrollers with no operating system. Robots need bounded timing, and Rust doesn't give you that for free: you get it by writing control loops that never allocate, never block on a lock, and get measured.",
    learn: [
      "`no_std` and `no_main`; `core` vs `alloc`",
      "PAC → HAL → board crates; `embedded-hal` traits for portable drivers",
      "GPIO, timers, PWM, I²C, SPI and UART",
      "Interrupts, critical sections and DMA",
      "Flashing and logging with `probe-rs` (or `espflash`) and `defmt`",
      "Static memory: `heapless` and `static_cell`",
      "Embassy's async executor vs RTIC",
      "Real time: bounded loops, and measuring jitter with a logic analyzer",
      "ROS 2 basics: nodes, topics, QoS; Rust nodes with `ros2_rust` or `r2r`",
      "Rust-native robotics runtimes: dora-rs and copper-rs",
      "Sensor fusion: a complementary filter, then a Kalman filter; PID control"
    ],
    read: [
      { t: "The Embedded Rust Book", u: "https://docs.rust-embedded.org/book/", note: "start here" },
      { t: "esp-rs", u: "https://github.com/esp-rs", note: "the Rust on ESP Book and `esp-hal`, maintained by Espressif" },
      { t: "Embassy", u: "https://embassy.dev", note: "the book, plus the examples for your chip" },
      { t: "Comprehensive Rust", u: "https://google.github.io/comprehensive-rust/", note: "Google's course; the bare-metal and concurrency days" },
      { t: "Ferrous Systems exercises", u: "https://rust-exercises.ferrous-systems.com", note: "embedded training material from a Rust consultancy" }
    ],
    build: {
      name: "reflexes", desc: "The microcontroller half of your robot: fast, fixed-memory, and measured.",
      steps: [
        "Blinky, then a button interrupt, then a PWM servo sweep, all on Embassy",
        "Write a `no_std` IMU driver against `embedded-hal` traits",
        "Complementary filter at 500 Hz; send orientation frames (`postcard`) over UART to the Pi",
        "Measure loop jitter with a logic analyzer and log it",
        "Run a tiny int8 gesture classifier on the microcontroller with your own kernels"
      ]
    },
    checks: [
      { n: "no_heap", t: "The firmware uses no heap; its memory use is fixed at build time" },
      { n: "jitter_within_budget", t: "Control-loop jitter is measured and stays inside your budget" },
      { n: "runs_24h", t: "The firmware runs 24 hours without a panic or reset" }
    ]
  },
  {
    id: "p7", n: 7, name: "Capstone & expertise", short: "Capstone", weeks: 8, ongoing: true, tracks: ["rust", "cpp", "ai", "emb"],
    why: "Tie everything into one system shaped like the work you want, and start doing what experts do: shipping, contributing upstream, and writing about it.",
    learnTitle: "Practice",
    learn: [
      "Contribute to Candle, Burn, Embassy, esp-hal, probe-rs or Servo; start with docs, tests and good first issues",
      "Get 5 pull requests merged across the ecosystem",
      "Write one technical post per phase, mined from `LEARNING.md`",
      "Mentor on Exercism and review other people's Rust",
      "Read This Week in Rust every week",
      "Read one module a week of tokio, candle or embassy source"
    ],
    read: [
      { t: "This Week in Rust", u: "https://this-week-in-rust.org", note: "the weekly newsletter" },
      { t: "Let's build a browser engine", u: "https://limpet.net/mbrubeck/2014/08/08/toy-layout-engine-1.html", note: "side quest: Matt Brubeck's toy engine, robinson" },
      { t: "Web Browser Engineering", u: "https://browser.engineering", note: "side quest: written in Python; port it to Rust" },
      { t: "Servo", u: "https://servo.org", note: "side quest: then read html5ever, Stylo and taffy" }
    ],
    build: {
      name: "Edge brain, real-time reflexes", desc: "The portfolio project this whole plan builds toward, scoped so one person can finish it.",
      steps: [
        "The Pi 5 runs a quantized model in Candle and turns speech or text into commands",
        "Commands reach the ESP32 over your compact protocol",
        "The ESP32 runs the servo and IMU loop on its own clock; nothing on the Pi can stall it",
        "One C++ library (llama.cpp or OpenCV) is called through your own binding",
        "Works fully offline; model updates arrive over a throttled link",
        "The README states memory, latency and bandwidth budgets, each backed by a measurement",
        "A short demo video and a write-up"
      ]
    },
    checks: [
      { n: "budgets_met", t: "Every budget in the README is backed by a measurement" },
      { n: "five_merged_prs", t: "5 merged pull requests in Rust ecosystem projects" },
      { n: "explain_any_line", t: "You can explain any line of the capstone, unsafe blocks included" }
    ]
  }
];
