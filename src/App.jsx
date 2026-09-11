import { useEffect, useState } from "react";

import {
  Sparkles,
  Video,
  Image as ImageIcon,
  History,
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
  LayoutDashboard,
  FolderKanban,
  Plus,
  MoreHorizontal,
  Activity,
  Heart,
  Library,
  Eye,
  Pencil,
  Trash2,
  Check,
  Cpu,
} from "lucide-react";

const models = {
  video: [
    {
      name: "Sora Standard",
      cost: 1,
      time: "~2 min",
      badge: "",
    },
    {
      name: "Sora Pro",
      cost: 2,
      time: "~3 min",
      badge: "PRO",
    },
    {
      name: "Veo 2",
      cost: 3,
      time: "~45 sec",
      badge: "",
    },
    {
      name: "Veo 3 Fast",
      cost: 1.5,
      time: "~35 sec",
      badge: "FAST",
    },
    {
      name: "Veo 3",
      cost: 2.5,
      time: "~50 sec",
      badge: "",
    },
    {
      name: "Gen-4 Turbo",
      cost: 1.5,
      time: "~30 sec",
      badge: "FAST",
    },
  ],

  image: [
    {
      name: "GPT Image",
      cost: 2,
      time: "~10 sec",
      badge: "PREMIUM",
    },
    {
      name: "Nano Banana 2",
      cost: 1,
      time: "~8 sec",
      badge: "",
    },
    {
      name: "Nano Banana 2 4K",
      cost: 2,
      time: "~15 sec",
      badge: "4K",
    },
    {
      name: "Gen-4 Image",
      cost: 1,
      time: "~20 sec",
      badge: "",
    },
  ],
};

const defaultProjects = [
  {
    id: "project-product-launch",
    name: "Product Launch",
    description:
      "Creative assets for a new product campaign.",
    color: "purple",
    createdAt: "Today",
  },
  {
    id: "project-social-campaign",
    name: "Social Campaign",
    description:
      "Short-form visuals and social media concepts.",
    color: "blue",
    createdAt: "Today",
  },
];

function App() {
  const [page, setPage] = useState("home");
  const [mobileOpen, setMobileOpen] = useState(false);

  const [credits, setCredits] = useState(() => {
    const saved = localStorage.getItem(
      "azaisai-credits"
    );

    return saved !== null
      ? Number(saved)
      : 8;
  });

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem(
      "azaisai-history"
    );

    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem(
      "azaisai-projects"
    );

    try {
      return saved
        ? JSON.parse(saved)
        : defaultProjects;
    } catch {
      return defaultProjects;
    }
  });

  const [generation, setGeneration] =
    useState(null);

  const [activeProjectId, setActiveProjectId] =
    useState(null);

  const [showProjectModal, setShowProjectModal] =
    useState(false);

  const [variationSource, setVariationSource] =
    useState(null);

  const [showVariationModal, setShowVariationModal] =
    useState(false);

  const [compareData, setCompareData] =
    useState(null);

  useEffect(() => {
    localStorage.setItem(
      "azaisai-credits",
      String(credits)
    );
  }, [credits]);

  useEffect(() => {
    localStorage.setItem(
      "azaisai-history",
      JSON.stringify(history)
    );
  }, [history]);

  useEffect(() => {
    localStorage.setItem(
      "azaisai-projects",
      JSON.stringify(projects)
    );
  }, [projects]);

  useEffect(() => {
    const handleVariation = (event) => {
      setVariationSource(event.detail);
      setShowVariationModal(true);
    };

    window.addEventListener(
      "azaisai-create-variation",
      handleVariation
    );

    return () => {
      window.removeEventListener(
        "azaisai-create-variation",
        handleVariation
      );
    };
  }, []);

  const navigate = (target) => {
    setPage(target);
    setMobileOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const openProject = (projectId) => {
    setActiveProjectId(projectId);
    navigate("project");
  };

  const createProject = (
    name,
    description
  ) => {
    const colors = [
      "purple",
      "blue",
      "pink",
      "green",
    ];

    const project = {
      id: `project-${Date.now()}`,
      name: name.trim(),
      description:
        description.trim() ||
        "A new creative project.",
      color:
        colors[projects.length % colors.length],
      createdAt: "Just now",
    };

    setProjects((items) => [
      project,
      ...items,
    ]);

    setShowProjectModal(false);

    setActiveProjectId(project.id);
    navigate("project");
  };

  const deleteProject = (projectId) => {
    setProjects((items) =>
      items.filter(
        (project) =>
          project.id !== projectId
      )
    );

    setHistory((items) =>
      items.map((item) =>
        item.projectId === projectId
          ? {
              ...item,
              projectId: null,
              projectName:
                "Personal Workspace",
            }
          : item
      )
    );

    if (activeProjectId === projectId) {
      setActiveProjectId(null);
      navigate("projects");
    }
  };

  const createGeneration = (
    type,
    prompt,
    model,
    projectId = null
  ) => {
    const selected = models[type].find(
      (m) => m.name === model
    );

    const cost = selected?.cost || 1;

    if (credits < cost) {
      navigate("pricing");
      return;
    }

    const project =
      projects.find(
        (p) => p.id === projectId
      ) || null;

    const itemId = Date.now();

    const item = {
      id: itemId,
      type,
      prompt,
      model,
      cost,
      creditsUsed: cost,
      status: "Queued",
      projectId:
        project?.id || null,
      projectName:
        project?.name ||
        "Personal Workspace",
      favorite: false,
      name:
        type === "video"
          ? "Cinematic Video"
          : "AI Image",
      artworkType:
        type === "video"
          ? "automotive"
          : "product",
      created: new Date().toISOString(),
    };

    setCredits((value) =>
      Math.max(0, value - cost)
    );

    setHistory((items) => [
      item,
      ...items,
    ]);

    setGeneration(item);

    setTimeout(() => {
      updateGenerationStatus(
        itemId,
        "Enhancing"
      );
    }, 1000);

    setTimeout(() => {
      updateGenerationStatus(
        itemId,
        "Generating"
      );
    }, 2800);

    setTimeout(() => {
      updateGenerationStatus(
        itemId,
        "Rendering"
      );
    }, 4800);

    setTimeout(() => {
      const completedItem = {
        ...item,
        status: "Completed",
      };

      setHistory((items) =>
        items.map((generation) =>
          generation.id === itemId
            ? completedItem
            : generation
        )
      );

      setGeneration(completedItem);
    }, 6800);
  };

  const updateGenerationStatus = (
    itemId,
    status
  ) => {
    setHistory((items) =>
      items.map((generation) =>
        generation.id === itemId
          ? {
              ...generation,
              status,
            }
          : generation
      )
    );

    setGeneration((current) =>
      current?.id === itemId
        ? {
            ...current,
            status,
          }
        : current
    );
  };

  const createVariation = (
    source,
    variationType
  ) => {
    if (!source) return null;

    const variationPrompts = {
      Camera:
        `${source.prompt}, alternate cinematic camera angle, dynamic perspective, professional camera composition`,

      Lighting:
        `${source.prompt}, dramatic studio lighting, cinematic highlights, realistic shadows, premium lighting design`,

      Style:
        `${source.prompt}, refined premium visual style, sophisticated artistic direction, polished creative treatment`,

      Background:
        `${source.prompt}, redesigned environment and background, visually rich surroundings, clean professional composition`,
    };

    const newPrompt =
      variationPrompts[variationType] ||
      source.prompt;

    const variationCost = 1;

    if (credits < variationCost) {
      navigate("pricing");
      return null;
    }

    const variation = {
      ...source,
      id: Date.now() + Math.floor(Math.random() * 1000),
      prompt: newPrompt,
      variationOf: source.id,
      variationType,
      status: "Completed",
      cost: variationCost,
      creditsUsed: variationCost,
      favorite: false,
      name: `${source.name || "Creative Asset"} — ${variationType}`,
      created: new Date().toISOString(),
    };

    setCredits((value) =>
      Math.max(0, value - variationCost)
    );

    setHistory((items) => [
      variation,
      ...items,
    ]);

    return variation;
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
        <HomePage
          navigate={navigate}
          credits={credits}
        />
      )}

      {page === "dashboard" && (
        <DashboardPage
          credits={credits}
          history={history}
          projects={projects}
          navigate={navigate}
          setActiveProjectId={
            setActiveProjectId
          }
        />
      )}

      {page === "projects" && (
        <ProjectsPage
          projects={projects}
          history={history}
          navigate={navigate}
          openProject={openProject}
          setShowProjectModal={
            setShowProjectModal
          }
          deleteProject={
            deleteProject
          }
        />
      )}

      {page === "project" && (
        <ProjectPage
          project={projects.find(
            (project) =>
              project.id ===
              activeProjectId
          )}
          history={history.filter(
            (item) =>
              item.projectId ===
              activeProjectId
          )}
          navigate={navigate}
          setShowProjectModal={
            setShowProjectModal
          }
        />
      )}

      {page === "video" && (
        <GeneratorPage
          type="video"
          title="Video Studio"
          description="Turn your ideas into cinematic AI videos."
          credits={credits}
          projects={projects}
          activeProjectId={
            activeProjectId
          }
          onGenerate={
            createGeneration
          }
        />
      )}

      {page === "image" && (
        <GeneratorPage
          type="image"
          title="Image Studio"
          description="Create stunning visuals from simple prompts."
          credits={credits}
          projects={projects}
          activeProjectId={
            activeProjectId
          }
          onGenerate={
            createGeneration
          }
        />
      )}

      {page === "history" && (
        <HistoryPage
          history={history}
          setHistory={setHistory}
          navigate={navigate}
        />
      )}

      {page === "pricing" && (
        <PricingPage
          onBuy={(amount) =>
            setCredits(
              (current) =>
                current + amount
            )
          }
        />
      )}

      {generation && (
        <GenerationModal
          generation={generation}
          close={() =>
            setGeneration(null)
          }
        />
      )}

      {showProjectModal && (
        <ProjectModal
          close={() =>
            setShowProjectModal(false)
          }
          createProject={
            createProject
          }
        />
      )}

      {showVariationModal &&
        variationSource && (
          <VariationModal
            source={variationSource}
            close={() => {
              setShowVariationModal(
                false
              );
              setVariationSource(
                null
              );
            }}
            createVariation={
              createVariation
            }
            openCompare={(
              original,
              variation
            ) => {
              setShowVariationModal(
                false
              );

              setVariationSource(
                null
              );

              setCompareData({
                original,
                variation,
              });
            }}
          />
        )}

      {compareData && (
        <CompareModal
          original={
            compareData.original
          }
          variation={
            compareData.variation
          }
          close={() =>
            setCompareData(null)
          }
        />
      )}

      <Footer navigate={navigate} />
    </div>
  );
}

/* =========================================================
   NAVBAR
   ========================================================= */

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
        <button
          className="brand"
          onClick={() =>
            navigate("home")
          }
        >
          <div className="brand-icon">
            <Sparkles size={17} />
          </div>

          <span>
            Azais
            <span className="brand-ai">
              Ai
            </span>
          </span>
        </button>

        <nav
          className={`nav-links ${
            mobileOpen
              ? "mobile-visible"
              : ""
          }`}
        >
          <button
            className={
              page === "dashboard"
                ? "active"
                : ""
            }
            onClick={() =>
              navigate("dashboard")
            }
          >
            <LayoutDashboard
              size={16}
            />
            Dashboard
          </button>

          <button
            className={
              page === "projects" ||
              page === "project"
                ? "active"
                : ""
            }
            onClick={() =>
              navigate("projects")
            }
          >
            <FolderKanban
              size={16}
            />
            Projects
          </button>

          <button
            className={
              page === "video"
                ? "active"
                : ""
            }
            onClick={() =>
              navigate("video")
            }
          >
            <Video size={16} />
            Video
          </button>

          <button
            className={
              page === "image"
                ? "active"
                : ""
            }
            onClick={() =>
              navigate("image")
            }
          >
            <ImageIcon size={16} />
            Image
          </button>

          <button
            className={
              page === "history"
                ? "active"
                : ""
            }
            onClick={() =>
              navigate("history")
            }
          >
            <History size={16} />
            Library
          </button>

          <button
            className={
              page === "pricing"
                ? "active"
                : ""
            }
            onClick={() =>
              navigate("pricing")
            }
          >
            Pricing
          </button>
        </nav>

        <div className="nav-right">
          <button
            className="credit-pill"
            onClick={() =>
              navigate("pricing")
            }
          >
            <Zap
              size={14}
              fill="currentColor"
            />
            {credits} credits
          </button>

          <button className="avatar">
            P
          </button>

          <button
            className="mobile-menu"
            onClick={() =>
              setMobileOpen(
                !mobileOpen
              )
            }
          >
            {mobileOpen ? (
              <X />
            ) : (
              <Menu />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

/* =========================================================
   HOME
   ========================================================= */

function HomePage({
  navigate,
  credits,
}) {
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
            <span>
              Bring it to life.
            </span>
          </h1>

          <p className="hero-description">
            Generate stunning videos and
            images with powerful AI models
            from one focused creative
            workspace.
          </p>

          <div className="hero-actions">
            <button
              className="primary-button large"
              onClick={() =>
                navigate("dashboard")
              }
            >
              Open workspace
              <ArrowRight size={17} />
            </button>

            <button
              className="secondary-button large"
              onClick={() =>
                navigate("image")
              }
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
            <span className="section-label">
              POWERED BY
            </span>

            <h2>
              The models you want.
            </h2>
          </div>

          <p>
            Pick the right model for your
            idea and generate
            professional-quality content.
          </p>
        </div>

        <div className="model-cards">
          {[
            ["Sora", "OpenAI", "Video"],
            ["Veo", "Google", "Video"],
            [
              "GPT Image",
              "OpenAI",
              "Image",
            ],
            [
              "Gen-4",
              "Runway",
              "Video + Image",
            ],
          ].map(
            ([name, company, type]) => (
              <div
                className="model-card"
                key={name}
              >
                <div className="model-card-icon">
                  <Sparkles size={20} />
                </div>

                <div>
                  <h3>{name}</h3>
                  <span>
                    {company}
                  </span>
                </div>

                <small>{type}</small>
              </div>
            )
          )}
        </div>
      </section>

      <section className="workflow-section">
        <div className="section-heading centered">
          <span className="section-label">
            CREATIVE WORKFLOW
          </span>

          <h2>
            From idea to output.
          </h2>

          <p>
            Plan, generate, iterate and
            organize your creative work.
          </p>
        </div>

        <div className="workflow">
          {[
            [
              "01",
              "Create a project",
              "Organize every asset around a clear creative goal.",
            ],
            [
              "02",
              "Generate",
              "Choose an AI model and turn your idea into an asset.",
            ],
            [
              "03",
              "Iterate",
              "Create variations and compare directions before deciding.",
            ],
          ].map(
            ([number, title, text]) => (
              <div
                className="workflow-item"
                key={number}
              >
                <div className="workflow-number">
                  {number}
                </div>

                <h3>{title}</h3>

                <p>{text}</p>
              </div>
            )
          )}
        </div>
      </section>

      <section className="cta-section">
        <div>
          <span className="section-label">
            READY?
          </span>

          <h2>
            Start creating with{" "}
            {credits} free credits.
          </h2>

          <p>
            Build your next idea inside
            the creative workspace.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() =>
            navigate("dashboard")
          }
        >
          Open your workspace
          <ArrowRight size={17} />
        </button>
      </section>
    </main>
  );
}

/* =========================================================
   CREATIVE ARTWORK
   ========================================================= */

function CreativeArtwork({
  type = "product",
  small = false,
}) {
  const artworks = {
    product: {
      className: "art-product",
      title: "PRODUCT",
      subtitle: "NEXT GEN",
      object: (
        <div className="art-phone">
          <div className="art-phone-camera" />
          <div className="art-phone-screen">
            <span>AI</span>
          </div>
        </div>
      ),
    },

    fashion: {
      className: "art-fashion",
      title: "EDITORIAL",
      subtitle: "01 / 26",
      object: (
        <div className="art-model">
          <div className="art-model-head" />
          <div className="art-model-body" />
          <div className="art-model-jacket" />
        </div>
      ),
    },

    automotive: {
      className: "art-automotive",
      title: "NIGHT DRIVE",
      subtitle: "CONCEPT 07",
      object: (
        <div className="art-car">
          <div className="art-car-roof" />
          <div className="art-car-body" />
          <div className="art-wheel left" />
          <div className="art-wheel right" />
          <div className="art-light left" />
          <div className="art-light right" />
        </div>
      ),
    },

    landscape: {
      className: "art-landscape",
      title: "EXPLORE",
      subtitle: "BEYOND THE HORIZON",
      object: (
        <div className="art-mountains">
          <div className="mountain mountain-back" />
          <div className="mountain mountain-middle" />
          <div className="mountain mountain-front" />
          <div className="art-sun" />
        </div>
      ),
    },

    cyberpunk: {
      className: "art-cyberpunk",
      title: "NEON CITY",
      subtitle: "AFTER DARK",
      object: (
        <div className="art-city">
          <div className="city-building b1" />
          <div className="city-building b2" />
          <div className="city-building b3" />
          <div className="city-building b4" />
          <div className="city-glow" />
        </div>
      ),
    },

    beauty: {
      className: "art-beauty",
      title: "PORTRAIT",
      subtitle: "SOFT LIGHT",
      object: (
        <div className="art-face">
          <div className="face-hair" />
          <div className="face-shape">
            <div className="face-eye eye-one" />
            <div className="face-eye eye-two" />
            <div className="face-nose" />
            <div className="face-mouth" />
          </div>
          <div className="face-flower flower-one" />
          <div className="face-flower flower-two" />
        </div>
      ),
    },
  };

  const artwork =
    artworks[type] ||
    artworks.product;

  return (
    <div
      className={`creative-art ${artwork.className} ${
        small
          ? "creative-art-small"
          : ""
      }`}
    >
      <div className="art-noise" />

      <div className="art-copy">
        <span>{artwork.title}</span>
        <small>
          {artwork.subtitle}
        </small>
      </div>

      <div className="art-object">
        {artwork.object}
      </div>

      <div className="art-orbit orbit-one" />
      <div className="art-orbit orbit-two" />
    </div>
  );
}

/* =========================================================
   DASHBOARD
   ========================================================= */

function DashboardPage({
  credits,
  projects,
  history,
  navigate,
  setActiveProjectId,
}) {
  const recentProjects =
    projects.slice(0, 2);

  const recentGenerations =
    history.slice(0, 4);

  const imageCount =
    history.filter(
      (item) =>
        item.type?.toLowerCase() ===
        "image"
    ).length;

  const videoCount =
    history.filter(
      (item) =>
        item.type?.toLowerCase() ===
        "video"
    ).length;

  const spentCredits =
    history.reduce(
      (total, item) =>
        total +
        Number(
          item.creditsUsed ||
            item.cost ||
            0
        ),
      0
    );

  const projectArtwork = [
    "product",
    "fashion",
  ];

  const generationArtwork = [
    "automotive",
    "landscape",
    "cyberpunk",
    "beauty",
  ];

  return (
    <main className="dashboard-page">
      <section className="dashboard-hero">
        <div className="dashboard-hero-content">
          <span className="dashboard-eyebrow">
            <Sparkles size={15} />
            CREATIVE WORKSPACE
          </span>

          <h1>
            Turn your ideas into{" "}
            <span>
              stunning reality.
            </span>
          </h1>

          <p>
            Create, iterate and organize
            professional AI images and
            videos from one focused
            workspace.
          </p>

          <div className="dashboard-actions">
            <button
              className="primary-button"
              onClick={() =>
                navigate("image")
              }
            >
              <Plus size={18} />
              Create image
              <ArrowRight size={17} />
            </button>

            <button
              className="secondary-button"
              onClick={() =>
                navigate("video")
              }
            >
              <Video size={17} />
              Generate video
            </button>
          </div>
        </div>

        <div className="dashboard-hero-art">
          <CreativeArtwork type="cyberpunk" />
        </div>
      </section>

      <section className="dashboard-stats">
        <StatCard
          icon={FolderKanban}
          label="Total projects"
          value={projects.length}
        />

        <StatCard
          icon={ImageIcon}
          label="Images generated"
          value={imageCount}
        />

        <StatCard
          icon={Video}
          label="Videos generated"
          value={videoCount}
        />

        <div className="dashboard-credit-card">
          <div className="dashboard-credit-icon">
            <Zap size={20} />
          </div>

          <div className="dashboard-credit-info">
            <span>
              Credits remaining
            </span>

            <strong>{credits}</strong>

            <div className="credit-progress">
              <div
                style={{
                  width: `${Math.min(
                    100,
                    (credits / 8) * 100
                  )}%`,
                }}
              />
            </div>

            <small>
              {spentCredits} credits
              used
            </small>
          </div>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-panel projects-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-eyebrow">
                PROJECTS
              </span>

              <h2>
                Recent projects
              </h2>

              <p>
                Pick up where you left
                off.
              </p>
            </div>

            <button
              className="text-button"
              onClick={() =>
                navigate("projects")
              }
            >
              View all
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="project-preview-grid">
            {recentProjects.map(
              (project, index) => (
                <button
                  key={project.id}
                  className="visual-project-card"
                  onClick={() => {
                    setActiveProjectId(
                      project.id
                    );
                    navigate("project");
                  }}
                >
                  <div className="visual-project-art">
                    <CreativeArtwork
                      type={
                        projectArtwork[
                          index %
                            projectArtwork.length
                        ]
                      }
                      small
                    />

                    <span className="asset-badge">
                      {
                        history.filter(
                          (item) =>
                            item.projectId ===
                            project.id
                        ).length
                      }{" "}
                      assets
                    </span>
                  </div>

                  <div className="visual-project-content">
                    <div>
                      <h3>
                        {project.name}
                      </h3>

                      <p>
                        {
                          project.description
                        }
                      </p>
                    </div>

                    <ArrowRight size={17} />
                  </div>
                </button>
              )
            )}

            <button
              className="create-project-card"
              onClick={() =>
                navigate("projects")
              }
            >
              <div className="create-project-icon">
                <Plus size={24} />
              </div>

              <strong>
                Create new project
              </strong>

              <span>
                Organize your ideas into
                focused creative
                directions.
              </span>
            </button>
          </div>
        </div>

        <div className="dashboard-panel usage-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-eyebrow">
                CREDIT INTELLIGENCE
              </span>

              <h2>
                Usage overview
              </h2>
            </div>

            <Zap
              size={22}
              className="panel-accent-icon"
            />
          </div>

          <div className="usage-main">
            <strong>{credits}</strong>
            <span>
              credits left
            </span>
          </div>

          <div className="usage-bar">
            <div
              style={{
                width: `${Math.min(
                  100,
                  (credits / 8) * 100
                )}%`,
              }}
            />
          </div>

          <div className="usage-labels">
            <span>
              {spentCredits} used
            </span>

            <span>
              8 initial
            </span>
          </div>

          <div className="usage-breakdown">
            <div>
              <ImageIcon size={17} />
              <span>Images</span>
              <strong>
                {imageCount}
              </strong>
            </div>

            <div>
              <Video size={17} />
              <span>Videos</span>
              <strong>
                {videoCount}
              </strong>
            </div>

            <div>
              <Zap size={17} />
              <span>Spent</span>
              <strong>
                {spentCredits}
              </strong>
            </div>
          </div>

          <button
            className="usage-upgrade"
            onClick={() =>
              navigate("pricing")
            }
          >
            <Zap size={17} />
            Get more credits
            <ArrowRight size={15} />
          </button>
        </div>
      </section>

      <section className="dashboard-panel generations-panel">
        <div className="panel-heading">
          <div>
            <span className="panel-eyebrow">
              ACTIVITY
            </span>

            <h2>
              Recent generations
            </h2>

            <p>
              Your latest creative work
              across all projects.
            </p>
          </div>

          <button
            className="text-button"
            onClick={() =>
              navigate("history")
            }
          >
            Open library
            <ArrowRight size={15} />
          </button>
        </div>

        {recentGenerations.length >
        0 ? (
          <div className="generation-visual-grid">
            {recentGenerations.map(
              (item, index) => (
                <div
                  className="generation-visual-card"
                  key={item.id}
                >
                  <CreativeArtwork
                    type={
                      generationArtwork[
                        index %
                          generationArtwork.length
                      ]
                    }
                    small
                  />

                  <div className="generation-overlay">
                    <span>
                      {item.type ===
                      "video" ? (
                        <>
                          <Play size={12} />
                          Video
                        </>
                      ) : (
                        <>
                          <ImageIcon
                            size={12}
                          />
                          Image
                        </>
                      )}
                    </span>

                    <small>
                      {item.created ||
                        "Just now"}
                    </small>
                  </div>

                  <div className="generation-info">
                    <strong>
                      {item.prompt
                        ? item.prompt.slice(
                            0,
                            34
                          )
                        : "AI generated creative"}
                      {item.prompt &&
                      item.prompt.length >
                        34
                        ? "..."
                        : ""}
                    </strong>

                    <span>
                      {item.model ||
                        "AI model"}{" "}
                      ·{" "}
                      {item.creditsUsed ||
                        item.cost ||
                        0}{" "}
                      credits
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="dashboard-empty">
            <div className="dashboard-empty-icon">
              <Sparkles size={24} />
            </div>

            <h3>
              Your creative canvas
              is ready
            </h3>

            <p>
              Generate your first image
              or video and it will
              appear here.
            </p>

            <button
              className="primary-button"
              onClick={() =>
                navigate("image")
              }
            >
              Start creating
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </section>

      <section className="quick-create-section">
        <div className="panel-heading">
          <div>
            <span className="panel-eyebrow">
              QUICK CREATE
            </span>

            <h2>
              Start with a direction
            </h2>
          </div>
        </div>

        <div className="quick-create-grid">
          <button
            onClick={() =>
              navigate("image")
            }
            className="quick-create-card"
          >
            <div className="quick-create-icon image">
              <ImageIcon size={20} />
            </div>

            <div>
              <strong>
                Generate image
              </strong>

              <span>
                Turn prompts into
                visuals
              </span>
            </div>

            <ArrowRight size={17} />
          </button>

          <button
            onClick={() =>
              navigate("video")
            }
            className="quick-create-card"
          >
            <div className="quick-create-icon video">
              <Video size={20} />
            </div>

            <div>
              <strong>
                Generate video
              </strong>

              <span>
                Bring ideas into
                motion
              </span>
            </div>

            <ArrowRight size={17} />
          </button>

          <button
            onClick={() =>
              navigate("projects")
            }
            className="quick-create-card"
          >
            <div className="quick-create-icon project">
              <FolderKanban
                size={20}
              />
            </div>

            <div>
              <strong>
                Create project
              </strong>

              <span>
                Organize your
                creative work
              </span>
            </div>

            <ArrowRight size={17} />
          </button>

          <button
            onClick={() =>
              navigate("history")
            }
            className="quick-create-card"
          >
            <div className="quick-create-icon library">
              <Library size={20} />
            </div>

            <div>
              <strong>
                View library
              </strong>

              <span>
                Browse all generated
                assets
              </span>
            </div>

            <ArrowRight size={17} />
          </button>
        </div>
      </section>
    </main>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="stat-card">
      <div className="stat-icon">
        <Icon size={20} />
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

/* =========================================================
   PROJECTS
   ========================================================= */

function ProjectsPage({
  projects,
  history,
  navigate,
  openProject,
  setShowProjectModal,
  deleteProject,
}) {
  return (
    <main className="workspace-page">
      <div className="page-heading-row">
        <div>
          <span className="section-label">
            WORKSPACE
          </span>

          <h1>Projects</h1>

          <p>
            Organize generations into
            focused creative projects.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() =>
            setShowProjectModal(
              true
            )
          }
        >
          <Plus size={16} />
          New project
        </button>
      </div>

      <div className="workspace-toolbar">
        <span className="toolbar-count">
          {projects.length}{" "}
          {projects.length === 1
            ? "project"
            : "projects"}
        </span>
      </div>

      {projects.length === 0 ? (
        <div className="workspace-empty">
          <div className="empty-icon">
            <FolderKanban size={22} />
          </div>

          <h2>
            Create your first project
          </h2>

          <p>
            Projects give your
            generations a place to live
            and make it easier to
            iterate on an idea.
          </p>

          <button
            className="primary-button"
            onClick={() =>
              setShowProjectModal(
                true
              )
            }
          >
            <Plus size={16} />
            Create project
          </button>
        </div>
      ) : (
        <div className="project-grid large">
          {projects.map(
            (project) => (
              <ProjectCard
                key={project.id}
                project={project}
                assets={history.filter(
                  (item) =>
                    item.projectId ===
                    project.id
                )}
                openProject={
                  openProject
                }
                deleteProject={
                  deleteProject
                }
              />
            )
          )}

          <button
            className="new-project-card large"
            onClick={() =>
              setShowProjectModal(
                true
              )
            }
          >
            <div className="new-project-icon">
              <Plus size={21} />
            </div>

            <strong>
              Create new project
            </strong>

            <span>
              Start another creative
              direction
            </span>
          </button>
        </div>
      )}
    </main>
  );
}

function ProjectCard({
  project,
  assets,
  openProject,
  deleteProject,
}) {
  return (
    <div className="project-card">
      <button
        className={`project-cover ${project.color}`}
        onClick={() =>
          openProject(
            project.id
          )
        }
      >
        <FolderKanban size={32} />

        <span className="project-preview-count">
          {assets.length}{" "}
          {assets.length === 1
            ? "asset"
            : "assets"}
        </span>
      </button>

      <div className="project-card-body">
        <div className="project-card-top">
          <div>
            <h3>{project.name}</h3>

            <p>
              {project.description}
            </p>
          </div>

          <button
            className="project-menu"
            title="Delete project"
            onClick={() =>
              deleteProject(
                project.id
              )
            }
          >
            <MoreHorizontal
              size={16}
            />
          </button>
        </div>

        <div className="project-meta">
          <span>
            <ImageIcon size={11} />
            {
              assets.filter(
                (item) =>
                  item.type ===
                  "image"
              ).length
            }{" "}
            images
          </span>

          <span>
            <Video size={11} />
            {
              assets.filter(
                (item) =>
                  item.type ===
                  "video"
              ).length
            }{" "}
            videos
          </span>

          <span className="project-date">
            {project.createdAt}
          </span>
        </div>

        <button
          className="project-open-button"
          onClick={() =>
            openProject(
              project.id
            )
          }
        >
          Open project
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}

function ProjectPage({
  project,
  history,
  navigate,
  setShowProjectModal,
}) {
  if (!project) {
    return (
      <main className="workspace-page">
        <div className="workspace-empty">
          <div className="empty-icon">
            <FolderKanban size={22} />
          </div>

          <h2>
            Project not found
          </h2>

          <p>
            This project may have
            been removed.
          </p>

          <button
            className="primary-button"
            onClick={() =>
              navigate("projects")
            }
          >
            Back to projects
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="workspace-page">
      <button
        className="back-button"
        onClick={() =>
          navigate("projects")
        }
      >
        ← Back to projects
      </button>

      <section className="project-detail-header">
        <div
          className={`project-detail-icon ${project.color}`}
        >
          <FolderKanban size={29} />
        </div>

        <div>
          <h1>{project.name}</h1>

          <p>
            {project.description}
          </p>

          <div className="project-detail-meta">
            <span>
              {history.length} assets
            </span>

            <span>
              Created{" "}
              {project.createdAt}
            </span>
          </div>
        </div>

        <div className="project-actions">
          <button
            className="secondary-button"
            onClick={() =>
              setShowProjectModal(
                true
              )
            }
          >
            <Plus size={15} />
            New project
          </button>

          <button
            className="primary-button"
            onClick={() =>
              navigate("image")
            }
          >
            <Sparkles size={15} />
            Create asset
          </button>
        </div>
      </section>

      <div className="workspace-section">
        <div className="workspace-section-heading">
          <div>
            <span className="section-label">
              PROJECT ASSETS
            </span>

            <h2>
              Creative output
            </h2>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="project-empty">
            <div className="empty-icon">
              <Sparkles size={22} />
            </div>

            <h2>
              Nothing here yet
            </h2>

            <p>
              Generate your first
              asset for this project.
            </p>

            <div className="project-empty-actions">
              <button
                className="primary-button"
                onClick={() =>
                  navigate("image")
                }
              >
                <ImageIcon size={15} />
                Create image
              </button>

              <button
                className="secondary-button"
                onClick={() =>
                  navigate("video")
                }
              >
                <Video size={15} />
                Create video
              </button>
            </div>
          </div>
        ) : (
          <div className="asset-grid">
            {history.map(
              (item) => (
                <AssetCard
                  key={item.id}
                  item={item}
                  onVariation={(asset) => {
                    window.dispatchEvent(
                      new CustomEvent(
                        "azaisai-create-variation",
                        { detail: asset }
                      )
                    );
                  }}
                />
              )
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function AssetCard({ item }) {
  const type =
    item.type?.toLowerCase();

  return (
    <div className="asset-card">
      <div
        className={`asset-preview ${type}`}
      >
        {type === "video" ? (
          <>
            <Video size={31} />

            <div className="asset-play">
              <Play
                size={13}
                fill="currentColor"
              />
            </div>
          </>
        ) : (
          <ImageIcon size={31} />
        )}
      </div>

      <div className="asset-card-body">
        <span className="asset-type">
          {type?.toUpperCase()}
        </span>

        <h3>
          {item.name ||
            item.model}
        </h3>

        <p>
          {item.prompt}
        </p>

        <div className="asset-footer">
          <span>
            <CheckCircle2 size={11} />
            {item.status}
          </span>

          <span>
            {item.creditsUsed ||
              item.cost ||
              0}{" "}
            credits
          </span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   GENERATOR
   ========================================================= */

function GeneratorPage({
  type,
  title,
  description,
  credits,
  projects,
  activeProjectId,
  onGenerate,
}) {
  const [selectedModel, setSelectedModel] =
    useState(
      models[type][0].name
    );

  const [prompt, setPrompt] =
    useState("");

  const [enhance, setEnhance] =
    useState(true);

  const [enhancing, setEnhancing] =
    useState(false);

  const [selectedProject, setSelectedProject] =
    useState(
      activeProjectId || ""
    );

  useEffect(() => {
    setSelectedProject(
      activeProjectId || ""
    );
  }, [activeProjectId]);

  const selected =
    models[type].find(
      (m) =>
        m.name === selectedModel
    );

  const enhancePrompt = () => {
    if (
      !prompt.trim() ||
      enhancing
    ) {
      return;
    }

    setEnhancing(true);

    setTimeout(() => {
      const enhanced =
        type === "image"
          ? `${prompt.trim()}, cinematic composition, professional visual direction, realistic lighting, detailed textures, premium color grading, high-end commercial photography, sharp focus, sophisticated composition`
          : `${prompt.trim()}, cinematic camera movement, natural lighting, detailed environment, realistic motion, professional film composition, atmospheric depth, smooth transitions, premium commercial production quality`;

      setPrompt(enhanced);
      setEnhancing(false);
    }, 900);
  };

  return (
    <main className="studio-page">
      <div className="studio-header">
        <div>
          <span className="section-label">
            {type === "video"
              ? "VIDEO GENERATION"
              : "IMAGE GENERATION"}
          </span>

          <h1>{title}</h1>

          <p>
            {description}
          </p>
        </div>

        <div className="studio-credit">
          <Zap size={15} />
          {credits} credits
          available
        </div>
      </div>

      <div className="studio-grid">
        <section className="studio-panel">
          <div className="panel-title">
            <span>
              Choose a model
            </span>

            <span className="muted">
              {models[type].length}{" "}
              models
            </span>
          </div>

          <div className="model-list">
            {models[type].map(
              (model) => (
                <button
                  key={model.name}
                  className={`studio-model ${
                    selectedModel ===
                    model.name
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    setSelectedModel(
                      model.name
                    )
                  }
                >
                  <div className="model-radio">
                    {selectedModel ===
                      model.name && (
                      <div />
                    )}
                  </div>

                  <div className="studio-model-info">
                    <strong>
                      {model.name}
                    </strong>

                    <span>
                      {model.time}
                    </span>
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
              )
            )}
          </div>

          <div className="project-selector">
            <div className="prompt-header">
              <span>
                Save to project
              </span>

              <span className="muted">
                Optional
              </span>
            </div>

            <select
              value={selectedProject}
              onChange={(e) =>
                setSelectedProject(
                  e.target.value
                )
              }
              className="project-select"
            >
              <option value="">
                No project
              </option>

              {projects.map(
                (project) => (
                  <option
                    value={
                      project.id
                    }
                    key={
                      project.id
                    }
                  >
                    {project.name}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="prompt-header">
            <span>
              Describe your {type}
            </span>

            <span className="muted">
              {prompt.length}/1000
            </span>
          </div>

          <textarea
            className="prompt-input"
            value={prompt}
            maxLength={1000}
            onChange={(e) =>
              setPrompt(
                e.target.value
              )
            }
            placeholder={
              type === "video"
                ? "Describe the video you want to create..."
                : "Describe the image you want to create..."
            }
          />

          <div className="prompt-actions-row">
            <button
              className={`enhance-button ${
                enhancing
                  ? "loading"
                  : ""
              }`}
              disabled={
                !prompt.trim() ||
                enhancing
              }
              onClick={
                enhancePrompt
              }
            >
              <Wand2
                size={14}
                className={
                  enhancing
                    ? "enhance-spin"
                    : ""
                }
              />

              {enhancing
                ? "Enhancing..."
                : "Enhance prompt"}
            </button>

            <div className="prompt-option">
              <button
                className={`toggle ${
                  enhance
                    ? "on"
                    : ""
                }`}
                onClick={() =>
                  setEnhance(
                    !enhance
                  )
                }
              >
                <span />
              </button>

              <span>
                AI optimization
              </span>
            </div>
          </div>

          {enhance && (
            <div className="enhance-tip">
              <Sparkles size={13} />

              <span>
                AI optimization improves
                composition, lighting
                and creative detail.
              </span>
            </div>
          )}

          <div className="generate-footer">
            <div>
              <span className="muted">
                Estimated cost
              </span>

              <strong>
                <Zap size={14} />
                {selected.cost}{" "}
                credits
              </strong>
            </div>

            <button
              className="primary-button generate-button"
              disabled={
                !prompt.trim() ||
                credits <
                  selected.cost
              }
              onClick={() =>
                onGenerate(
                  type,
                  prompt,
                  selectedModel,
                  selectedProject ||
                    null
                )
              }
            >
              <Sparkles size={16} />
              Generate {type}
            </button>
          </div>
        </section>

        <section className="preview-panel">
          <div className="preview-top">
            <span>
              Preview
            </span>

            <span className="preview-status">
              <span />
              Ready
            </span>
          </div>

          <div
            className={`preview-canvas ${type}`}
          >
            {type === "video" ? (
              <div className="fake-video">
                <div className="fake-sun" />
                <div className="fake-mountain one" />
                <div className="fake-mountain two" />

                <div className="play-circle">
                  <Play
                    size={20}
                    fill="currentColor"
                  />
                </div>
              </div>
            ) : (
              <div className="fake-image">
                <div className="image-orb orb-one" />
                <div className="image-orb orb-two" />
                <div className="image-object" />
              </div>
            )}

            <div className="preview-overlay">
              <Sparkles size={16} />

              <span>
                Your generated content
                will appear here
              </span>
            </div>
          </div>

          <div className="preview-tip">
            <Zap size={15} />

            <span>
              Generation usually takes{" "}
              {selected.time}.
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   PRICING
   ========================================================= */

function PricingPage({ onBuy }) {
  const plans = [
    {
      name: "Starter",
      price: "16.90",
      credits: 60,
      description:
        "For exploring AI creation.",
    },
    {
      name: "Pro",
      price: "32.90",
      credits: 180,
      description:
        "For creators producing regularly.",
      popular: true,
    },
    {
      name: "Business",
      price: "65.90",
      credits: 420,
      description:
        "For serious creative workflows.",
    },
  ];

  return (
    <main className="pricing-page">
      <div className="pricing-heading">
        <span className="section-label">
          PLANS & CREDITS
        </span>

        <h1>
          Create without limits.
        </h1>

        <p>
          Choose the plan that fits
          your creative workflow.
        </p>
      </div>

      <div className="pricing-grid">
        {plans.map((plan) => (
          <div
            className={`pricing-card ${
              plan.popular
                ? "popular"
                : ""
            }`}
            key={plan.name}
          >
            {plan.popular && (
              <div className="popular-label">
                <Star
                  size={13}
                  fill="currentColor"
                />
                MOST POPULAR
              </div>
            )}

            <h2>{plan.name}</h2>

            <p>
              {plan.description}
            </p>

            <div className="price">
              <span>$</span>
              {plan.price}

              <small>
                /month
              </small>
            </div>

            <div className="credits">
              <Zap size={15} />
              {plan.credits} credits
              / month
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
              onClick={() =>
                onBuy(
                  plan.credits
                )
              }
            >
              Choose{" "}
              {plan.name}

              <ArrowRight size={16} />
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}

/* =========================================================
   GENERATION MODAL
   ========================================================= */

function GenerationModal({
  generation,
  close,
}) {
  const statusInfo = {
    Queued: {
      label: "Queued",
      description:
        "Your request has been added to the generation queue.",
      icon: <Clock3 size={22} />,
      progress: 15,
    },

    Enhancing: {
      label: "Enhancing prompt",
      description:
        "AI is improving your prompt for better results.",
      icon: <Wand2 size={22} />,
      progress: 35,
    },

    Generating: {
      label: "Generating",
      description:
        "The AI model is creating your asset.",
      icon: <Sparkles size={22} />,
      progress: 65,
    },

    Rendering: {
      label: "Rendering",
      description:
        "Final details are being processed.",
      icon: <Activity size={22} />,
      progress: 88,
    },

    Completed: {
      label: "Generation complete",
      description:
        "Your asset has been successfully created.",
      icon: (
        <CheckCircle2 size={22} />
      ),
      progress: 100,
    },
  };

  const current =
    statusInfo[
      generation.status
    ] || statusInfo.Queued;

  const completed =
    generation.status ===
    "Completed";

  return (
    <div
      className="modal-backdrop"
      onClick={
        completed
          ? close
          : undefined
      }
    >
      <div
        className={`generation-modal ${
          completed
            ? "generation-completed"
            : "generation-processing"
        }`}
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        <div className="modal-preview">
          <div
            className={`modal-art ${generation.type} ${
              completed
                ? "completed-art"
                : "processing-art"
            }`}
          >
            {generation.type ===
            "video" ? (
              <Video size={35} />
            ) : (
              <ImageIcon size={35} />
            )}

            {!completed && (
              <div className="generation-orbit">
                <div />
              </div>
            )}
          </div>
        </div>

        <div className="modal-content">
          <div
            className={`generation-status-icon ${
              completed
                ? "success"
                : "processing"
            }`}
          >
            {current.icon}
          </div>

          <span className="generation-status-label">
            {current.label}
          </span>

          <h2>
            {completed
              ? "Your creation is ready"
              : "Creating your asset"}
          </h2>

          <p>
            {current.description}
          </p>

          <div className="generation-progress">
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width: `${current.progress}%`,
                }}
              />
            </div>

            <div className="progress-meta">
              <span>
                {current.progress}%
                complete
              </span>

              <span>
                {generation.status}
              </span>
            </div>
          </div>

          <div className="generation-steps">
            <GenerationStep
              label="Queued"
              active={[
                "Queued",
                "Enhancing",
                "Generating",
                "Rendering",
                "Completed",
              ].includes(
                generation.status
              )}
              done={[
                "Enhancing",
                "Generating",
                "Rendering",
                "Completed",
              ].includes(
                generation.status
              )}
            />

            <GenerationStep
              label="Enhancing"
              active={[
                "Enhancing",
                "Generating",
                "Rendering",
                "Completed",
              ].includes(
                generation.status
              )}
              done={[
                "Generating",
                "Rendering",
                "Completed",
              ].includes(
                generation.status
              )}
            />

            <GenerationStep
              label="Generating"
              active={[
                "Generating",
                "Rendering",
                "Completed",
              ].includes(
                generation.status
              )}
              done={[
                "Rendering",
                "Completed",
              ].includes(
                generation.status
              )}
            />

            <GenerationStep
              label="Rendering"
              active={[
                "Rendering",
                "Completed",
              ].includes(
                generation.status
              )}
              done={
                generation.status ===
                "Completed"
              }
            />

            <GenerationStep
              label="Complete"
              active={completed}
              done={completed}
            />
          </div>

          <div className="modal-details">
            <span>Model</span>

            <strong>
              {generation.model}
            </strong>

            <span>Cost</span>

            <strong>
              {generation.cost} credits
            </strong>

            <span>Project</span>

            <strong>
              {generation.projectName}
            </strong>
          </div>

          {completed ? (
            <>
              <div className="modal-actions">
                <button
                  className="primary-button"
                  onClick={() =>
                    downloadAssetFile(
                      generation
                    )
                  }
                >
                  <Download size={16} />
                  Download
                </button>

                <button
                  className="secondary-button"
                  onClick={() => {
                    close();

                    window.dispatchEvent(
                      new CustomEvent(
                        "azaisai-create-variation",
                        {
                          detail:
                            generation,
                        }
                      )
                    );
                  }}
                >
                  <Wand2 size={15} />
                  Create variation
                </button>
              </div>

              <button
                className="modal-close-text"
                onClick={close}
              >
                Done
              </button>
            </>
          ) : (
            <div className="generation-wait">
              <Clock3 size={14} />

              <span>
                You can continue
                exploring the workspace
                while this runs.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function GenerationStep({
  label,
  active,
  done,
}) {
  return (
    <div
      className={`generation-step ${
        active ? "active" : ""
      } ${done ? "done" : ""}`}
    >
      <div className="step-dot">
        {done && (
          <CheckCircle2 size={13} />
        )}
      </div>

      <span>{label}</span>
    </div>
  );
}

/* =========================================================
   PROJECT MODAL
   ========================================================= */

function ProjectModal({
  close,
  createProject,
}) {
  const [name, setName] =
    useState("");

  const [description, setDescription] =
    useState("");

  const submit = (event) => {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    createProject(
      name,
      description
    );
  };

  return (
    <div
      className="modal-backdrop"
      onClick={close}
    >
      <form
        className="project-modal"
        onSubmit={submit}
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        <div className="project-modal-header">
          <div className="modal-icon">
            <FolderKanban
              size={20}
            />
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={close}
          >
            <X size={18} />
          </button>
        </div>

        <h2>
          Create a project
        </h2>

        <p>
          Give your creative work a
          home. Attach image and video
          generations to it.
        </p>

        <label>
          Project name

          <input
            autoFocus
            value={name}
            onChange={(e) =>
              setName(
                e.target.value
              )
            }
            placeholder="e.g. Summer campaign"
          />
        </label>

        <label>
          Description{" "}
          <span className="optional">
            Optional
          </span>

          <textarea
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
            placeholder="What are you creating?"
          />
        </label>

        <div className="project-modal-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={close}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="primary-button"
            disabled={!name.trim()}
          >
            <Plus size={15} />
            Create project
          </button>
        </div>
      </form>
    </div>
  );
}

/* =========================================================
   VARIATION MODAL
   ========================================================= */

function VariationModal({
  source,
  close,
  createVariation,
  openCompare,
}) {
  const [selectedType, setSelectedType] =
    useState("Camera");

  const options = [
    {
      name: "Camera",
      description:
        "Try a different angle or perspective.",
      icon: "◈",
    },
    {
      name: "Lighting",
      description:
        "Explore a new lighting direction.",
      icon: "☼",
    },
    {
      name: "Style",
      description:
        "Give the asset a different visual treatment.",
      icon: "✦",
    },
    {
      name: "Background",
      description:
        "Place the subject in a new environment.",
      icon: "◇",
    },
  ];

  const variationPrompt =
    {
      Camera:
        `${source.prompt}, alternate cinematic camera angle, dynamic perspective, professional camera composition`,

      Lighting:
        `${source.prompt}, dramatic studio lighting, cinematic highlights, realistic shadows, premium lighting design`,

      Style:
        `${source.prompt}, refined premium visual style, sophisticated artistic direction, polished creative treatment`,

      Background:
        `${source.prompt}, redesigned environment and background, visually rich surroundings, clean professional composition`,
    }[selectedType];

  return (
    <div
      className="modal-backdrop"
      onClick={close}
    >
      <div
        className="variation-modal"
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        <div className="variation-header">
          <div>
            <span className="section-label">
              CREATIVE ITERATION
            </span>

            <h2>
              Create a variation
            </h2>

            <p>
              Keep the original idea while
              exploring another creative
              direction.
            </p>
          </div>

          <button
            className="modal-close"
            onClick={close}
          >
            <X size={18} />
          </button>
        </div>

        <div className="variation-layout">
          <div className="variation-options">
            <span className="variation-heading">
              WHAT DO YOU WANT TO
              CHANGE?
            </span>

            {options.map(
              (option) => (
                <button
                  key={
                    option.name
                  }
                  className={`variation-option ${
                    selectedType ===
                    option.name
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    setSelectedType(
                      option.name
                    )
                  }
                >
                  <div className="variation-option-icon">
                    {option.icon}
                  </div>

                  <div>
                    <strong>
                      {option.name}
                    </strong>

                    <p>
                      {
                        option.description
                      }
                    </p>
                  </div>

                  <ArrowRight
                    size={14}
                  />
                </button>
              )
            )}
          </div>

          <div className="variation-preview-column">
            <span className="variation-heading">
              PREVIEW
            </span>

            <div className="compare-preview">
              <div className="compare-label">
                ORIGINAL
              </div>

              <div
                className={`compare-art ${source.type}`}
              >
                {source.type ===
                "video" ? (
                  <Video size={30} />
                ) : (
                  <ImageIcon
                    size={30}
                  />
                )}
              </div>

              <div className="variation-arrow">
                <ArrowRight
                  size={17}
                />
              </div>

              <div className="compare-label">
                VARIATION
              </div>

              <div
                className={`compare-art variation ${source.type}`}
              >
                {source.type ===
                "video" ? (
                  <Video size={30} />
                ) : (
                  <ImageIcon
                    size={30}
                  />
                )}

                <div className="variation-spark">
                  <Sparkles size={13} />
                  {selectedType}
                </div>
              </div>
            </div>

            <div className="variation-prompt">
              <span>
                NEW DIRECTION
              </span>

              <p>
                {variationPrompt}
              </p>
            </div>

            <button
              className="primary-button variation-generate"
              onClick={() => {
                const result =
                  createVariation(
                    source,
                    selectedType
                  );

                if (result) {
                  openCompare(
                    source,
                    result
                  );
                }
              }}
            >
              <Wand2 size={16} />
              Generate variation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   COMPARE
   ========================================================= */

function CompareModal({
  original,
  variation,
  close,
}) {
  const [selected, setSelected] =
    useState("variation");

  return (
    <div
      className="modal-backdrop"
      onClick={close}
    >
      <div
        className="compare-modal"
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        <div className="compare-header">
          <div>
            <span className="section-label">
              COMPARE VERSIONS
            </span>

            <h2>
              Choose your direction
            </h2>

            <p>
              Compare the original and
              variation side by side.
            </p>
          </div>

          <button
            className="modal-close"
            onClick={close}
          >
            <X size={18} />
          </button>
        </div>

        <div className="compare-grid">
          <CompareCard
            label="A"
            title="Original"
            item={original}
            selected={
              selected ===
              "original"
            }
            onClick={() =>
              setSelected(
                "original"
              )
            }
          />

          <CompareCard
            label="B"
            title={`Variation · ${variation.variationType}`}
            item={variation}
            selected={
              selected ===
              "variation"
            }
            onClick={() =>
              setSelected(
                "variation"
              )
            }
          />
        </div>

        <div className="compare-footer">
          <div>
            <span>
              SELECTED VERSION
            </span>

            <strong>
              {selected ===
              "original"
                ? "A — Original"
                : "B — Variation"}
            </strong>
          </div>

          <div className="compare-actions">
            <button
              className="secondary-button"
              onClick={close}
            >
              Cancel
            </button>

            <button
              className="primary-button"
              onClick={close}
            >
              <CheckCircle2
                size={16}
              />
              Keep{" "}
              {selected ===
              "original"
                ? "A"
                : "B"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompareCard({
  label,
  title,
  item,
  selected,
  onClick,
}) {
  return (
    <button
      className={`compare-card ${
        selected
          ? "selected"
          : ""
      }`}
      onClick={onClick}
    >
      <div className="compare-card-header">
        <div className="compare-version">
          {label}
        </div>

        <div>
          <strong>
            {title}
          </strong>

          {selected && (
            <span className="selected-label">
              SELECTED
            </span>
          )}
        </div>
      </div>

      <div
        className={`compare-large-art ${item.type}`}
      >
        {item.type === "video" ? (
          <>
            <Video size={38} />

            <div className="compare-play">
              <Play
                size={14}
                fill="currentColor"
              />
            </div>
          </>
        ) : (
          <ImageIcon size={38} />
        )}
      </div>

      <div className="compare-card-info">
        <span>
          {item.model}
        </span>

        <p>
          {item.prompt}
        </p>
      </div>
    </button>
  );
}

/* =========================================================
   HISTORY / CREATIVE LIBRARY
   ========================================================= */

function HistoryPage({ history, setHistory, navigate }) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  const filters = [
    { id: "all", label: "All" },
    { id: "image", label: "Images" },
    { id: "video", label: "Videos" },
    { id: "processing", label: "Processing" },
  ];

  const filteredHistory = history.filter((item) => {
    const type = String(item.type || "").toLowerCase();
    const status = String(item.status || "").toLowerCase();
    const query = searchQuery.toLowerCase().trim();

    // Filter by type/status
    if (activeFilter === "image" && type !== "image") {
      return false;
    }

    if (activeFilter === "video" && type !== "video") {
      return false;
    }

    if (
      activeFilter === "processing" &&
      !["queued", "enhancing", "generating", "rendering"].includes(status)
    ) {
      return false;
    }

    // Search
    if (query) {
      const searchableText = [
        item.name,
        item.prompt,
        item.model,
        item.projectName,
        item.type,
        item.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!searchableText.includes(query)) {
        return false;
      }
    }

    return true;
  });

  const toggleFavorite = (id) => {
    setHistory((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              favorite: !item.favorite,
            }
          : item
      )
    );
  };

  const deleteItem = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this generation?"
    );

    if (!confirmed) return;

    setHistory((current) => current.filter((item) => item.id !== id));
  };

  const startRename = (item) => {
    setEditingId(item.id);
    setEditingName(
      item.name ||
        (item.type === "image" ? "Image Generation" : "Video Generation")
    );
  };

  const saveRename = (id) => {
    const trimmedName = editingName.trim();

    if (!trimmedName) {
      setEditingId(null);
      setEditingName("");
      return;
    }

    setHistory((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              name: trimmedName,
            }
          : item
      )
    );

    setEditingId(null);
    setEditingName("");
  };

  const cancelRename = () => {
    setEditingId(null);
    setEditingName("");
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "Recently";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Recently";
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateValue) => {
    if (!dateValue) return "";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getStatusClass = (status) => {
    const normalized = String(status || "").toLowerCase();

    if (normalized === "completed") {
      return "status-completed";
    }

    if (
      ["queued", "enhancing", "generating", "rendering"].includes(normalized)
    ) {
      return "status-processing";
    }

    if (normalized === "failed") {
      return "status-failed";
    }

    return "";
  };

  const getStatusIcon = (status) => {
    const normalized = String(status || "").toLowerCase();

    if (normalized === "completed") {
      return <CheckCircle2 size={14} />;
    }

    if (
      ["queued", "enhancing", "generating", "rendering"].includes(normalized)
    ) {
      return <Clock3 size={14} />;
    }

    return null;
  };

  return (
    <main className="page-shell history-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="eyebrow">
            <Library size={15} />
            Creative Library
          </div>

          <h1>Your Generations</h1>

          <p>
            Browse, organize and manage everything you have created in AzaisAi.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => navigate("image")}
        >
          <Plus size={18} />
          Create New
        </button>
      </div>

      {/* Toolbar */}
      <div className="library-toolbar">
        {/* Filters */}
        <div className="library-filters">
          {filters.map((filter) => (
            <button
              key={filter.id}
              className={
                activeFilter === filter.id
                  ? "library-filter active"
                  : "library-filter"
              }
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.label}

              <span>
                {filter.id === "all"
                  ? history.length
                  : filter.id === "image"
                  ? history.filter(
                      (item) =>
                        String(item.type || "").toLowerCase() === "image"
                    ).length
                  : filter.id === "video"
                  ? history.filter(
                      (item) =>
                        String(item.type || "").toLowerCase() === "video"
                    ).length
                  : history.filter((item) =>
                      ["queued", "enhancing", "generating", "rendering"].includes(
                        String(item.status || "").toLowerCase()
                      )
                    ).length}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="library-search">
          <Search size={17} />

          <input
            type="text"
            placeholder="Search generations..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />

          {searchQuery && (
            <button
              className="search-clear"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {filteredHistory.length === 0 ? (
        <div className="library-empty">
          <div className="library-empty-icon">
            {searchQuery ? (
              <Search size={28} />
            ) : (
              <Sparkles size={28} />
            )}
          </div>

          <h2>
            {searchQuery
              ? "No generations found"
              : activeFilter === "processing"
              ? "Nothing is processing"
              : activeFilter === "image"
              ? "No images yet"
              : activeFilter === "video"
              ? "No videos yet"
              : "Your creative library is empty"}
          </h2>

          <p>
            {searchQuery
              ? "Try a different search term or clear your search."
              : "Create your first AI-generated asset and it will appear here."}
          </p>

          <div className="library-empty-actions">
            {searchQuery ? (
              <button
                className="secondary-button"
                onClick={() => setSearchQuery("")}
              >
                <X size={17} />
                Clear Search
              </button>
            ) : (
              <>
                <button
                  className="primary-button"
                  onClick={() => navigate("image")}
                >
                  <ImageIcon size={17} />
                  Create Image
                </button>

                <button
                  className="secondary-button"
                  onClick={() => navigate("video")}
                >
                  <Video size={17} />
                  Create Video
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="library-grid">
          {filteredHistory.map((item) => {
            const type = String(item.type || "").toLowerCase();
            const status = String(item.status || "").toLowerCase();

            const isImage = type === "image";
            const isVideo = type === "video";
            const isProcessing = [
              "queued",
              "enhancing",
              "generating",
              "rendering",
            ].includes(status);

            const displayName =
              item.name ||
              (isImage ? "Image Generation" : "Video Generation");

            return (
              <article className="library-card" key={item.id}>
                {/* Preview */}
                <div className="library-card-preview">
                  <CreativeArtwork
                    type={
                      isImage
                        ? "product"
                        : isVideo
                        ? "automotive"
                        : "product"
                    }
                  />

                  <div className="library-card-type">
                    {isVideo ? (
                      <>
                        <Video size={13} />
                        Video
                      </>
                    ) : (
                      <>
                        <ImageIcon size={13} />
                        Image
                      </>
                    )}
                  </div>

                  {isVideo && !isProcessing && (
                    <div className="library-play-button">
                      <Play size={18} fill="currentColor" />
                    </div>
                  )}

                  {isProcessing && (
                    <div className="library-processing-overlay">
                      <div className="processing-spinner" />
                      <span>
                        {item.status || "Generating"}
                      </span>
                    </div>
                  )}

                  {/* Favorite */}
                  <button
                    className={
                      item.favorite
                        ? "library-favorite active"
                        : "library-favorite"
                    }
                    onClick={() => toggleFavorite(item.id)}
                    aria-label={
                      item.favorite
                        ? "Remove from favorites"
                        : "Add to favorites"
                    }
                  >
                    <Heart
                      size={17}
                      fill={item.favorite ? "currentColor" : "none"}
                    />
                  </button>
                </div>

                {/* Content */}
                <div className="library-card-content">
                  {editingId === item.id ? (
                    <div className="library-rename">
                      <input
                        autoFocus
                        value={editingName}
                        onChange={(event) =>
                          setEditingName(event.target.value)
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            saveRename(item.id);
                          }

                          if (event.key === "Escape") {
                            cancelRename();
                          }
                        }}
                      />

                      <div className="library-rename-actions">
                        <button
                          onClick={() => saveRename(item.id)}
                          aria-label="Save name"
                        >
                          <Check size={15} />
                        </button>

                        <button
                          onClick={cancelRename}
                          aria-label="Cancel rename"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="library-card-title-row">
                      <h3 title={displayName}>{displayName}</h3>

                      <div className="library-card-menu">
                        <button
                          aria-label="Rename generation"
                          onClick={() => startRename(item)}
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          aria-label="Delete generation"
                          onClick={() => deleteItem(item.id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  )}

                  <p className="library-card-prompt">
                    {item.prompt || "No prompt available"}
                  </p>

                  <div className="library-card-meta">
                    <span>
                      <Cpu size={13} />
                      {item.model || "AI Model"}
                    </span>

                    {item.projectName && (
                      <span>
                        <FolderKanban size={13} />
                        {item.projectName}
                      </span>
                    )}
                  </div>

                  <div className="library-card-footer">
                    <span className="library-card-date">
                      {formatDate(item.created)}
                      {formatTime(item.created) &&
                        ` · ${formatTime(item.created)}`}
                    </span>

                    <span
                      className={`library-status ${getStatusClass(
                        item.status
                      )}`}
                    >
                      {getStatusIcon(item.status)}
                      {item.status || "Completed"}
                    </span>
                  </div>

                  <div className="library-card-bottom">
                    <span className="library-credit-cost">
                      <Zap size={13} />
                      {Number(item.creditsUsed ?? item.cost ?? 0)} credits
                    </span>

                    <button
                      className="library-download"
                      onClick={() => downloadAssetFile(item)}
                    >
                      <Download size={15} />
                      Download
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Search result summary */}
      {filteredHistory.length > 0 && (
        <div className="library-result-summary">
          <span>
            Showing <strong>{filteredHistory.length}</strong>{" "}
            {filteredHistory.length === 1 ? "generation" : "generations"}
          </span>

          {searchQuery && (
            <button onClick={() => setSearchQuery("")}>
              Clear search
            </button>
          )}
        </div>
      )}
    </main>
  );
}

/* =========================================================
   DOWNLOAD HELPER
   ========================================================= */

function downloadAssetFile(item) {
  const content = `AzaisAi Asset

Name: ${
    item.name ||
    "Untitled"
  }

Type: ${item.type}

Model: ${
    item.model ||
    "AI model"
  }

Credits: ${
    item.creditsUsed ||
    item.cost ||
    0
  }

Project: ${
    item.projectName ||
    "Personal Workspace"
  }

Prompt:
${item.prompt || ""}

Status: ${
    item.status ||
    "Completed"
  }
`;

  const blob = new Blob(
    [content],
    {
      type: "text/plain",
    }
  );

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;

  link.download = `${(
    item.name ||
    "azaisai-asset"
  )
    .replace(
      /[^a-z0-9]/gi,
      "-"
    )
    .toLowerCase()}.txt`;

  document.body.appendChild(link);

  link.click();

  link.remove();

  URL.revokeObjectURL(url);
}

/* =========================================================
   FOOTER
   ========================================================= */

function Footer({ navigate }) {
  return (
    <footer className="footer">
      <div className="footer-brand">
        <div className="brand">
          <div className="brand-icon">
            <Sparkles size={15} />
          </div>

          <span>
            Azais
            <span className="brand-ai">
              Ai
            </span>
          </span>
        </div>

        <p>
          AI creation, simplified.
        </p>
      </div>

      <div className="footer-links">
        <button
          onClick={() =>
            navigate("dashboard")
          }
        >
          Dashboard
        </button>

        <button
          onClick={() =>
            navigate("projects")
          }
        >
          Projects
        </button>

        <button
          onClick={() =>
            navigate("video")
          }
        >
          Video
        </button>

        <button
          onClick={() =>
            navigate("image")
          }
        >
          Images
        </button>

        <button
          onClick={() =>
            navigate("history")
          }
        >
          Library
        </button>

        <button
          onClick={() =>
            navigate("pricing")
          }
        >
          Pricing
        </button>
      </div>

      <div className="footer-copy">
        © 2026 AzaisAi Rebuild
      </div>
    </footer>
  );
}

export default App;