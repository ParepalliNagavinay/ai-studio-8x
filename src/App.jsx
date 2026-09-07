import { useState } from "react";
import {
  Sparkles,
  Video,
  Image as ImageIcon,
  History,
  CreditCard,
  ChevronDown,
  Zap,
  Download,
  Wand2,
  Search,
  Clock3,
  CheckCircle2,
  Play,
  Menu,
  X,
  ArrowRight,
  Star,
} from "lucide-react";

const models = {
  video: [
    { name: "Sora Standard", cost: 1, time: "~2 min", badge: "" },
    { name: "Sora Pro", cost: 2, time: "~3 min", badge: "PRO" },
    { name: "Veo 2", cost: 3, time: "~45 sec", badge: "" },
    { name: "Veo 3 Fast", cost: 1.5, time: "~35 sec", badge: "FAST" },
    { name: "Veo 3", cost: 2.5, time: "~50 sec", badge: "" },
    { name: "Gen-4 Turbo", cost: 1.5, time: "~30 sec", badge: "FAST" },
  ],
  image: [
    { name: "GPT Image", cost: 2, time: "~10 sec", badge: "PREMIUM" },
    { name: "Nano Banana 2", cost: 1, time: "~8 sec", badge: "" },
    { name: "Nano Banana 2 4K", cost: 2, time: "~15 sec", badge: "4K" },
    { name: "Gen-4 Image", cost: 1, time: "~20 sec", badge: "" },
  ],
};

function App() {
  const [page, setPage] = useState("home");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [credits, setCredits] = useState(8);
  const [history, setHistory] = useState([]);
  const [generation, setGeneration] = useState(null);

  const navigate = (target) => {
    setPage(target);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const createGeneration = (type, prompt, model) => {
    const selected = models[type].find((m) => m.name === model);
    const cost = selected?.cost || 1;

    if (credits < cost) {
      navigate("pricing");
      return;
    }

    setCredits((value) => Math.max(0, value - cost));

    const item = {
      id: Date.now(),
      type,
      prompt,
      model,
      cost,
      status: "Completed",
      created: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setHistory((items) => [item, ...items]);
    setGeneration(item);
  };

  return (
    <div className="app">
      <Navbar
        page={page}
        credits={credits}
        navigate={navigate}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {page === "home" && (
        <HomePage navigate={navigate} credits={credits} />
      )}

      {page === "video" && (
        <GeneratorPage
          type="video"
          title="Video Studio"
          description="Turn your ideas into cinematic AI videos."
          credits={credits}
          onGenerate={createGeneration}
        />
      )}

      {page === "image" && (
        <GeneratorPage
          type="image"
          title="Image Studio"
          description="Create stunning visuals from simple prompts."
          credits={credits}
          onGenerate={createGeneration}
        />
      )}

      {page === "history" && (
        <HistoryPage history={history} />
      )}

      {page === "pricing" && (
        <PricingPage onBuy={(amount) => setCredits((c) => c + amount)} />
      )}

      {generation && (
        <GenerationModal
          generation={generation}
          close={() => setGeneration(null)}
        />
      )}

      <Footer navigate={navigate} />
    </div>
  );
}

function Navbar({
  page,
  credits,
  navigate,
  mobileOpen,
  setMobileOpen,
}) {
  return (
    <header className="navbar">
      <div className="nav-inner">
        <button className="brand" onClick={() => navigate("home")}>
          <div className="brand-icon">
            <Sparkles size={17} />
          </div>
          <span>Azais<span className="brand-ai">Ai</span></span>
        </button>

        <nav className={`nav-links ${mobileOpen ? "mobile-visible" : ""}`}>
          <button
            className={page === "video" ? "active" : ""}
            onClick={() => navigate("video")}
          >
            <Video size={16} />
            Video Generation
          </button>

          <button
            className={page === "image" ? "active" : ""}
            onClick={() => navigate("image")}
          >
            <ImageIcon size={16} />
            Image Generation
          </button>

          <button
            className={page === "history" ? "active" : ""}
            onClick={() => navigate("history")}
          >
            <History size={16} />
            History
          </button>

          <button onClick={() => navigate("pricing")}>
            Pricing
          </button>
        </nav>

        <div className="nav-right">
          <button
            className="credit-pill"
            onClick={() => navigate("pricing")}
          >
            <Zap size={14} fill="currentColor" />
            {credits} credits
          </button>

          <button className="avatar">
            P
          </button>

          <button
            className="mobile-menu"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}

function HomePage({ navigate, credits }) {
  return (
    <main>
      <section className="hero">
        <div className="hero-glow glow-one" />
        <div className="hero-glow glow-two" />

        <div className="hero-content">
          <div className="eyebrow">
            <Sparkles size={14} />
            AI CREATIVE STUDIO
          </div>

          <h1>
            Create anything.
            <br />
            <span>Bring it to life.</span>
          </h1>

          <p className="hero-description">
            Generate stunning videos and images with the world's
            most powerful AI models — all from one simple workspace.
          </p>

          <div className="hero-actions">
            <button
              className="primary-button large"
              onClick={() => navigate("video")}
            >
              Start creating
              <ArrowRight size={17} />
            </button>

            <button
              className="secondary-button large"
              onClick={() => navigate("image")}
            >
              Explore image generation
            </button>
          </div>

          <div className="hero-trust">
            <span>
              <CheckCircle2 size={15} />
              8 free credits
            </span>
            <span>
              <CheckCircle2 size={15} />
              No credit card
            </span>
            <span>
              <CheckCircle2 size={15} />
              Multiple AI models
            </span>
          </div>
        </div>
      </section>

      <section className="models-section">
        <div className="section-heading">
          <div>
            <span className="section-label">POWERED BY</span>
            <h2>The models you want.</h2>
          </div>

          <p>
            Pick the right model for your idea and generate
            professional-quality content in seconds.
          </p>
        </div>

        <div className="model-cards">
          {[
            ["Sora", "OpenAI", "Video"],
            ["Veo", "Google", "Video"],
            ["GPT Image", "OpenAI", "Image"],
            ["Gen-4", "Runway", "Video + Image"],
          ].map(([name, company, type]) => (
            <div className="model-card" key={name}>
              <div className="model-card-icon">
                <Sparkles size={20} />
              </div>
              <div>
                <h3>{name}</h3>
                <span>{company}</span>
              </div>
              <small>{type}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="workflow-section">
        <div className="section-heading centered">
          <span className="section-label">SIMPLE WORKFLOW</span>
          <h2>From idea to output.</h2>
          <p>
            No complicated tools. Just describe what you want,
            choose a model, and create.
          </p>
        </div>

        <div className="workflow">
          {[
            ["01", "Pick your model", "Choose from leading AI video and image models."],
            ["02", "Describe it", "Turn your imagination into a detailed prompt."],
            ["03", "Download & use", "Generate, review and download your creation."],
          ].map(([number, title, text]) => (
            <div className="workflow-item" key={number}>
              <div className="workflow-number">{number}</div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <div>
          <span className="section-label">READY?</span>
          <h2>Start creating with {credits} free credits.</h2>
          <p>No credit card required.</p>
        </div>

        <button
          className="primary-button"
          onClick={() => navigate("video")}
        >
          Create your first generation
          <ArrowRight size={17} />
        </button>
      </section>
    </main>
  );
}

function GeneratorPage({
  type,
  title,
  description,
  credits,
  onGenerate,
}) {
  const [selectedModel, setSelectedModel] = useState(
    models[type][0].name
  );
  const [prompt, setPrompt] = useState("");
  const [enhance, setEnhance] = useState(true);

  const selected = models[type].find(
    (m) => m.name === selectedModel
  );

  return (
    <main className="studio-page">
      <div className="studio-header">
        <div>
          <span className="section-label">
            {type === "video" ? "VIDEO GENERATION" : "IMAGE GENERATION"}
          </span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>

        <div className="studio-credit">
          <Zap size={15} />
          {credits} credits available
        </div>
      </div>

      <div className="studio-grid">
        <section className="studio-panel">
          <div className="panel-title">
            <span>Choose a model</span>
            <span className="muted">
              {models[type].length} models
            </span>
          </div>

          <div className="model-list">
            {models[type].map((model) => (
              <button
                key={model.name}
                className={`studio-model ${
                  selectedModel === model.name ? "selected" : ""
                }`}
                onClick={() => setSelectedModel(model.name)}
              >
                <div className="model-radio">
                  {selectedModel === model.name && <div />}
                </div>

                <div className="studio-model-info">
                  <strong>{model.name}</strong>
                  <span>{model.time}</span>
                </div>

                {model.badge && (
                  <span className="model-badge">
                    {model.badge}
                  </span>
                )}

                <span className="model-cost">
                  {model.cost} cr
                </span>
              </button>
            ))}
          </div>

          <div className="prompt-header">
            <span>Describe your {type}</span>
            <span className="muted">
              {prompt.length}/1000
            </span>
          </div>

          <textarea
            className="prompt-input"
            value={prompt}
            maxLength={1000}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              type === "video"
                ? "Describe the video you want to create..."
                : "Describe the image you want to create..."
            }
          />

          <div className="prompt-options">
            <button
              className={`toggle ${enhance ? "on" : ""}`}
              onClick={() => setEnhance(!enhance)}
            >
              <span />
            </button>
            <span>Enhance prompt</span>

            <button className="variation-button">
              <Wand2 size={14} />
              Variation
            </button>
          </div>

          <div className="generate-footer">
            <div>
              <span className="muted">Estimated cost</span>
              <strong>
                <Zap size={14} />
                {selected.cost} credits
              </strong>
            </div>

            <button
              className="primary-button generate-button"
              disabled={!prompt.trim()}
              onClick={() =>
                onGenerate(type, prompt, selectedModel)
              }
            >
              <Sparkles size={16} />
              Generate {type}
            </button>
          </div>
        </section>

        <section className="preview-panel">
          <div className="preview-top">
            <span>Preview</span>
            <span className="preview-status">
              <span />
              Ready
            </span>
          </div>

          <div className={`preview-canvas ${type}`}>
            {type === "video" ? (
              <>
                <div className="fake-video">
                  <div className="fake-sun" />
                  <div className="fake-mountain one" />
                  <div className="fake-mountain two" />
                  <div className="play-circle">
                    <Play size={20} fill="currentColor" />
                  </div>
                </div>
              </>
            ) : (
              <div className="fake-image">
                <div className="image-orb orb-one" />
                <div className="image-orb orb-two" />
                <div className="image-object" />
              </div>
            )}

            <div className="preview-overlay">
              <Sparkles size={16} />
              <span>Your generated content will appear here</span>
            </div>
          </div>

          <div className="preview-tip">
            <Zap size={15} />
            <span>
              Generation usually takes {selected.time}.
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}

function HistoryPage({ history }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = history.filter((item) => {
    const matchesSearch = item.prompt
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" ||
      item.type === filter.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  return (
    <main className="history-page">
      <div className="page-heading">
        <div>
          <span className="section-label">YOUR WORKSPACE</span>
          <h1>Generation history</h1>
          <p>
            Review every generation, track status, and revisit
            past prompts.
          </p>
        </div>
      </div>

      <div className="history-toolbar">
        <div className="history-tabs">
          {["All", "Video", "Image"].map((tab) => (
            <button
              className={filter === tab ? "active" : ""}
              onClick={() => setFilter(tab)}
              key={tab}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="search-box">
          <Search size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search generations..."
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-history">
          <div className="empty-icon">
            <History size={25} />
          </div>
          <h2>No generations yet</h2>
          <p>
            Your generated videos and images will appear here.
          </p>
        </div>
      ) : (
        <div className="history-list">
          {filtered.map((item) => (
            <div className="history-item" key={item.id}>
              <div
                className={`history-thumb ${item.type}`}
              >
                {item.type === "video" ? (
                  <Video size={22} />
                ) : (
                  <ImageIcon size={22} />
                )}
              </div>

              <div className="history-content">
                <div className="history-title">
                  <strong>{item.model}</strong>
                  <span className="completed">
                    <CheckCircle2 size={14} />
                    {item.status}
                  </span>
                </div>
                <p>{item.prompt}</p>
                <small>
                  <Clock3 size={12} />
                  {item.created} · {item.cost} credits
                </small>
              </div>

              <button className="icon-button">
                <Download size={17} />
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

function PricingPage({ onBuy }) {
  const plans = [
    {
      name: "Starter",
      price: "16.90",
      credits: 60,
      description: "For exploring AI creation.",
    },
    {
      name: "Pro",
      price: "32.90",
      credits: 180,
      description: "For creators producing regularly.",
      popular: true,
    },
    {
      name: "Business",
      price: "65.90",
      credits: 420,
      description: "For serious creative workflows.",
    },
  ];

  return (
    <main className="pricing-page">
      <div className="pricing-heading">
        <span className="section-label">PLANS & CREDITS</span>
        <h1>Create without limits.</h1>
        <p>
          Choose the plan that fits your creative workflow.
        </p>
      </div>

      <div className="pricing-grid">
        {plans.map((plan) => (
          <div
            className={`pricing-card ${
              plan.popular ? "popular" : ""
            }`}
            key={plan.name}
          >
            {plan.popular && (
              <div className="popular-label">
                <Star size={13} fill="currentColor" />
                MOST POPULAR
              </div>
            )}

            <h2>{plan.name}</h2>
            <p>{plan.description}</p>

            <div className="price">
              <span>$</span>
              {plan.price}
              <small>/month</small>
            </div>

            <div className="credits">
              <Zap size={15} />
              {plan.credits} credits / month
            </div>

            <div className="plan-features">
              <span>
                <CheckCircle2 size={15} />
                AI image generation
              </span>
              <span>
                <CheckCircle2 size={15} />
                AI video generation
              </span>
              <span>
                <CheckCircle2 size={15} />
                Multiple AI models
              </span>
              <span>
                <CheckCircle2 size={15} />
                Generation history
              </span>
            </div>

            <button
              className={
                plan.popular
                  ? "primary-button full"
                  : "secondary-button full"
              }
              onClick={() => onBuy(plan.credits)}
            >
              Choose {plan.name}
              <ArrowRight size={16} />
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}

function GenerationModal({ generation, close }) {
  return (
    <div className="modal-backdrop" onClick={close}>
      <div
        className="generation-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-preview">
          <div className={`modal-art ${generation.type}`}>
            <Sparkles size={32} />
          </div>
        </div>

        <div className="modal-content">
          <div className="success-icon">
            <CheckCircle2 size={22} />
          </div>

          <h2>Generation complete</h2>

          <p>
            Your {generation.type} was generated successfully
            using <strong>{generation.model}</strong>.
          </p>

          <div className="modal-details">
            <span>Model</span>
            <strong>{generation.model}</strong>

            <span>Cost</span>
            <strong>{generation.cost} credits</strong>
          </div>

          <div className="modal-actions">
            <button className="primary-button">
              <Download size={16} />
              Download
            </button>
            <button className="secondary-button" onClick={close}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Footer({ navigate }) {
  return (
    <footer className="footer">
      <div className="footer-brand">
        <div className="brand">
          <div className="brand-icon">
            <Sparkles size={15} />
          </div>
          <span>Azais<span className="brand-ai">Ai</span></span>
        </div>
        <p>AI creation, simplified.</p>
      </div>

      <div className="footer-links">
        <button onClick={() => navigate("video")}>Video</button>
        <button onClick={() => navigate("image")}>Images</button>
        <button onClick={() => navigate("history")}>History</button>
        <button onClick={() => navigate("pricing")}>Pricing</button>
      </div>

      <div className="footer-copy">
        © 2026 AzaisAi Rebuild
      </div>
    </footer>
  );
}

export default App;