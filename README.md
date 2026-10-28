# Rust to the Metal

A year-long learning roadmap from Rust basics to edge AI and embedded robotics, with C++ for interop, built as a small web app that saves your progress.

**Live:** https://debnathsd.github.io/rust-cpp/

The roadmap has 8 phases, about 59 weeks at 10 hours a week:

| Phase | Weeks | You build |
|---|---|---|
| 0 · Set up the workshop | 1 | Toolchain, a `rust-journey` repo, a learning log |
| 1 · Ownership mindset | 6 | `logscan`: streams a 2 GB log in under 20 MB of memory |
| 2 · Idiomatic Rust | 6 | `tensorlite`: an N-dimensional tensor crate |
| 3 · Systems & performance | 10 | A fast matmul (tiling, `rayon`, NEON) and a lock-free ring buffer |
| 4 · C++ and interop | 8 | Your own `llama-sys` binding to llama.cpp |
| 5 · Edge AI in Rust | 10 | `tinychat`: a quantized model on a Mac, then a Raspberry Pi 5 |
| 6 · Embedded & robotics | 10 | ESP32 firmware: IMU, servo, no heap, measured jitter |
| 7 · Capstone & expertise | 8, then ongoing | Pi 5 "brain" plus ESP32 "reflexes", and upstream contributions |

Every phase lists what to learn, what to read, what to build, and three exit checks to pass before moving on. You can change the start date and weekly pace; all dates follow.

## How it works

- Plain HTML, CSS and JavaScript modules. No build step, served by GitHub Pages from `main`.
- **Sign-in:** Firebase Authentication with Google. Nothing but the sign-in screen shows until you're signed in.
- **Storage:** Cloud Firestore keeps one document per person, `users/<uid>`, holding the ticked items, start date and pace. [`firestore.rules`](firestore.rules) only lets each person read and write their own document.
- Firestore's local cache lets you tick items offline. Changes sync when you're back online, and another open tab or device updates live.

| File | What it is |
|---|---|
| `index.html` | Sign-in screen and the roadmap page |
| `assets/roadmap.js` | The roadmap content: phases, items, resources, exit checks |
| `assets/app.js` | Rendering, sign-in and saving |
| `assets/firebase-config.js` | Your Firebase project's web config |
| `firestore.rules` | Database security rules |

## Setup

You need a free Firebase project (the Spark plan is enough).

1. **Create the project.** At [console.firebase.google.com](https://console.firebase.google.com), choose *Create a project*. Google Analytics isn't needed.
2. **Turn on Google sign-in.** *Build → Authentication → Get started → Sign-in method → Google → Enable*, pick a support email, *Save*.
3. **Allow the site's domain.** *Authentication → Settings → Authorized domains → Add domain*: `debnathsd.github.io`.
4. **Create the database.** *Build → Firestore Database → Create database*. Keep the database ID `(default)`, choose a nearby location, and start in *production mode*.
5. **Add the rules.** *Firestore Database → Rules*: replace everything with the contents of [`firestore.rules`](firestore.rules), then *Publish*. To keep the tracker to yourself only, use the commented email line in that file.
6. **Register the web app.** *Project settings (gear) → General → Your apps → Web (`</>`)*. Give it a nickname, skip Firebase Hosting, and copy the `firebaseConfig` object it shows into [`assets/firebase-config.js`](assets/firebase-config.js) in place of `null`.
7. **Turn on GitHub Pages.** In this repository: *Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main`, folder `/ (root)` → Save*.

The `apiKey` in the Firebase config identifies the project and is meant to ship in web pages; the security rules are what protect your data. For extra safety you can restrict that key to `https://debnathsd.github.io/*` under *Google Cloud console → APIs & Services → Credentials*.

## Run it locally

ES modules don't load from `file://`, so serve the folder:

```bash
python3 -m http.server 5183
```

Then open http://localhost:5183. `localhost` is an authorized domain in new Firebase projects by default, so sign-in works there too.

## Editing the roadmap

All content lives in `assets/roadmap.js`. Saved progress is keyed by each item's position within its list, so add new items at the end of a list rather than in the middle.
