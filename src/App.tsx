import { useEffect, useMemo, useState } from "react";

// Importaciones de Firebase SDK v10+ (Modular)
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";

// Configuración de tu proyecto en Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC2iexQvY1xjFMjy9qZSRjZsLYkfqGU0uk",
  authDomain: "onlytoon-82f3f.firebaseapp.com",
  projectId: "onlytoon-82f3f",
  storageBucket: "onlytoon-82f3f.firebasestorage.app",
  messagingSenderId: "1049602208943",
  appId: "1:1049602208943:web:a8b9f17768e8dce4e6905a",
};

// ⚠️ Cambia esta dirección por tu correo real de Google
const ADMIN_EMAIL = "tu-correo-admin@gmail.com";

// Inicialización de Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

type View =
  | { name: "home" }
  | { name: "creator"; creator: string }
  | { name: "project"; creator: string; project: string }
  | { name: "products" }
  | { name: "community" }
  | { name: "topic"; topic: CommunityTopic }
  | { name: "profile" };

type CommunityTopic = {
  title: string;
  author: string;
  category: string;
  replies: number;
};

type Video = {
  title: string;
  creator: string;
  image: string;
  duration: string;
  type: string;
  genre: string;
  year: string;
  format: string;
  youtubeUrl?: string;
};

const images = {
  mountain:
    "https://images.unsplash.com/photo-1613390382265-5a0547806df3?auto=format&fit=crop&w=1600&q=85",
  portrait:
    "https://images.unsplash.com/photo-1688407368246-df0f8608f99b?auto=format&fit=crop&w=1400&q=85",
  island:
    "https://images.unsplash.com/photo-1772026676494-178273ebe34e?auto=format&fit=crop&w=1400&q=85",
  city: "https://images.unsplash.com/photo-1696734337635-c0f1f08a7cc7?auto=format&fit=crop&w=1400&q=85",
  train:
    "https://images.unsplash.com/photo-1726413980098-d5148ea519a9?auto=format&fit=crop&w=1400&q=85",
  cage: "https://images.unsplash.com/photo-1633430552351-51caf0fb16a8?auto=format&fit=crop&w=1400&q=85",
  fluid:
    "https://images.unsplash.com/photo-1757428139428-2579e2317dd5?auto=format&fit=crop&w=1400&q=85",
  flowers:
    "https://images.unsplash.com/photo-1681106447892-fde093d56df8?auto=format&fit=crop&w=1400&q=85",
};

const initialVideos: Video[] = [
  {
    title: "Los gigantes del hielo",
    creator: "Luna Norte Studio",
    image: images.mountain,
    duration: "12:48",
    type: "3D",
    genre: "Fantasía",
    year: "2025",
    format: "Cortometraje",
  },
  {
    title: "Órbita interior",
    creator: "Martín Ochoa",
    image: images.portrait,
    duration: "08:20",
    type: "IA",
    genre: "Drama",
    year: "2025",
    format: "Musical",
  },
  {
    title: "Archipiélago violeta",
    creator: "Luna Norte Studio",
    image: images.island,
    duration: "22:14",
    type: "2D",
    genre: "Fantasía",
    year: "2024",
    format: "Serie",
  },
  {
    title: "Neón, capítulo cero",
    creator: "Marea Films",
    image: images.city,
    duration: "04:56",
    type: "IA",
    genre: "Acción",
    year: "2025",
    format: "Tráiler",
  },
  {
    title: "Último tren a casa",
    creator: "Taller Bruma",
    image: images.train,
    duration: "16:03",
    type: "Stop motion",
    genre: "Drama",
    year: "2023",
    format: "Cortometraje",
  },
  {
    title: "La fiesta imposible",
    creator: "Taller Bruma",
    image: images.cage,
    duration: "09:41",
    type: "Stop motion",
    genre: "Comedia",
    year: "2024",
    format: "Publicidad",
  },
  {
    title: "Materia sensible",
    creator: "Marea Films",
    image: images.fluid,
    duration: "06:18",
    type: "3D",
    genre: "Experimental",
    year: "2025",
    format: "Musical",
  },
  {
    title: "Pintar un mundo",
    creator: "Martín Ochoa",
    image: images.flowers,
    duration: "18:32",
    type: "2D",
    genre: "Tutorial",
    year: "2023",
    format: "Tutorial",
  },
];

function Icon({
  name,
  size = 20,
}: {
  name:
    | "play"
    | "search"
    | "arrow"
    | "chevron"
    | "grid"
    | "spark"
    | "heart"
    | "chat"
    | "bookmark"
    | "user"
    | "eye";
  size?: number;
}) {
  const paths = {
    play: <path d="m9 7 8 5-8 5V7Z" fill="currentColor" />,
    search: (
      <>
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4 4" />
      </>
    ),
    arrow: <path d="m15 18-6-6 6-6" />,
    chevron: <path d="m8 10 4 4 4-4" />,
    grid: (
      <>
        <rect x="4" y="4" width="6" height="6" rx="1" />
        <rect x="14" y="4" width="6" height="6" rx="1" />
        <rect x="4" y="14" width="6" height="6" rx="1" />
        <rect x="14" y="14" width="6" height="6" rx="1" />
      </>
    ),
    spark: <path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5L12 2Z" />,
    heart: (
      <path d="M20.8 5.8c-1.7-1.8-4.6-1.8-6.4 0L12 8.2 9.6 5.8a4.5 4.5 0 0 0-6.4 6.4L12 21l8.8-8.8a4.5 4.5 0 0 0 0-6.4Z" />
    ),
    chat: <path d="M20 15a3 3 0 0 1-3 3H9l-5 3v-6a3 3 0 0 1-1-2V7a3 3 0 0 1 3-3h11a3 3 0 0 1 3 3v8Z" />,
    bookmark: <path d="M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18l-6-4-6 4V4Z" />,
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    eye: (
      <>
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
  };
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      {paths[name]}
    </svg>
  );
}

function Button({
  children,
  className = "",
  onClick,
  label,
  type = "button",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  label?: string;
  type?: "button" | "submit";
  style?: React.CSSProperties;
}) {
  return (
    <button aria-label={label} className={className} onClick={onClick} type={type} style={style}>
      {children}
    </button>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="filter">
      <span>{label}</span>
      <span className="select-shell">
        <select value={value} onChange={(event) => onChange(event.target.value)}>
          <option value="">Todos</option>
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
        <Icon name="chevron" size={16} />
      </span>
    </label>
  );
}

function Header({
  navigate,
  onRegister,
  user,
  onLogout,
  videosList,
  onOpenAdminModal,
}: {
  navigate: (view: View) => void;
  onRegister: () => void;
  user: User | null;
  onLogout: () => void;
  videosList: Video[];
  onOpenAdminModal: () => void;
}) {
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin = user?.email === ADMIN_EMAIL;

  const suggestions = query.trim()
    ? videosList
        .filter(
          (video) =>
            video.title.toLowerCase().includes(query.toLowerCase()) ||
            video.creator.toLowerCase().includes(query.toLowerCase()),
        )
        .slice(0, 5)
    : [];

  const userInitials = user?.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "US";

  return (
    <header className="topbar">
      <Button className="brand" onClick={() => navigate({ name: "home" })} label="Ir al inicio">
        <span style={{ fontSize: "1.4rem", fontWeight: "900", letterSpacing: "1px", color: "#fff" }}>
          ONLY<span style={{ color: "#3b82f6" }}>TOONS</span>
        </span>
      </Button>
      <div className="global-search">
        <Icon name="search" size={18} />
        <input
          aria-label="Buscar videos o creadores"
          placeholder="Buscar videos o creadores"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        {query && (
          <div className="search-results">
            {suggestions.map((video) => (
              <Button
                className="search-result"
                key={video.title}
                onClick={() => {
                  navigate({ name: "creator", creator: video.creator });
                  setQuery("");
                }}
              >
                <img src={video.image} alt="" />
                <span>
                  <strong>{video.title}</strong>
                  <small>{video.creator}</small>
                </span>
              </Button>
            ))}
            {!suggestions.length && <p>Sin resultados</p>}
          </div>
        )}
      </div>
      <nav aria-label="Navegación principal">
        <Button className="nav-link" onClick={() => navigate({ name: "home" })}>
          Explorar
        </Button>
        <Button className="nav-link" onClick={() => navigate({ name: "products" })}>
          Productos
        </Button>
        <Button className="nav-link" onClick={() => navigate({ name: "community" })}>
          Comunidad
        </Button>

        {isAdmin ? (
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <Button
              className="dark-button"
              onClick={onOpenAdminModal}
              style={{ backgroundColor: "#2563eb", color: "#fff", padding: "8px 16px", borderRadius: "10px" }}
            >
              + Añadir Vídeo
            </Button>
            <Button className="nav-link" onClick={onLogout}>
              Salir (Admin)
            </Button>
          </div>
        ) : user ? (
          <div className="user-menu">
            <Button className="user-trigger" onClick={() => setMenuOpen(!menuOpen)}>
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "Usuario"}
                  style={{ width: "28px", height: "28px", borderRadius: "50%" }}
                />
              ) : (
                <span>{userInitials}</span>
              )}
              <Icon name="chevron" size={15} />
            </Button>
            {menuOpen && (
              <div className="user-dropdown">
                <div>
                  <strong>{user.displayName || "Usuario"}</strong>
                  <small>{user.email}</small>
                </div>
                <Button
                  onClick={() => {
                    navigate({ name: "profile" });
                    setMenuOpen(false);
                  }}
                >
                  <Icon name="user" size={17} /> Mi perfil
                </Button>
                <Button
                  onClick={() => {
                    onLogout();
                    setMenuOpen(false);
                  }}
                >
                  Cerrar sesión
                </Button>
              </div>
            )}
          </div>
        ) : (
          <Button className="register-button" onClick={onRegister}>
            Acceder con Google
          </Button>
        )}
      </nav>
    </header>
  );
}

function VideoCard({
  video,
  onOpen,
  isAdmin,
  onDelete,
}: {
  video: Video;
  onOpen: () => void;
  isAdmin?: boolean;
  onDelete?: () => void;
}) {
  return (
    <article className="video-card" style={{ position: "relative" }}>
      {isAdmin && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`¿Eliminar "${video.title}"?`)) onDelete?.();
          }}
          title="Eliminar vídeo"
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            zIndex: 30,
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "50%",
            width: "30px",
            height: "30px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          ✕
        </button>
      )}
      <Button className="thumbnail" onClick={onOpen} label={`Ver creador de ${video.title}`}>
        <img src={video.image} alt="" />
        <span className="play">
          <Icon name="play" size={22} />
        </span>
        <span className="duration">{video.duration}</span>
      </Button>
      <div className="video-meta">
        <Button className="video-title" onClick={onOpen}>
          {video.title}
        </Button>
        <p>{video.creator}</p>
        <div className="tag-row">
          <span>{video.type}</span>
          <span>{video.format}</span>
        </div>
      </div>
    </article>
  );
}

function Home({
  navigate,
  videosList,
  isAdmin,
  onDeleteVideo,
}: {
  navigate: (view: View) => void;
  videosList: Video[];
  isAdmin?: boolean;
  onDeleteVideo: (title: string) => void;
}) {
  const [slide, setSlide] = useState(0);
  const [filters, setFilters] = useState({ type: "", genre: "", year: "", format: "" });
  const [visibleCount, setVisibleCount] = useState(8);

  const featured = videosList.slice(0, 5);
  const current = featured[slide] || videosList[0];

  useEffect(() => {
    if (!featured.length) return;
    const timer = window.setInterval(
      () => setSlide((currentSlide) => (currentSlide + 1) % featured.length),
      6000,
    );
    return () => window.clearInterval(timer);
  }, [featured.length]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1999 }, (_, index) =>
    String(currentYear - index),
  );
  const genres = [
    "Acción",
    "Aventura",
    "Ciencia ficción",
    "Sci-fi",
    "Fantasía",
    "Grimdark",
    "Drama",
    "Comedia",
    "Terror",
    "Suspense",
    "Romance",
    "Documental",
    "Experimental",
    "Infantil",
    "Tutorial",
  ];

  const filtered = useMemo(
    () =>
      videosList.filter(
        (video) =>
          (!filters.type || video.type === filters.type) &&
          (!filters.genre || video.genre === filters.genre) &&
          (!filters.year || video.year === filters.year) &&
          (!filters.format || video.format === filters.format),
      ),
    [filters, videosList],
  );

  const update = (key: keyof typeof filters) => (value: string) =>
    setFilters((previous) => {
      setVisibleCount(8);
      return { ...previous, [key]: value };
    });

  return (
    <main>
      {current && (
        <section className="hero" aria-label="Contenido destacado">
          {featured.map((video, index) => (
            <img
              key={video.title}
              className={index === slide ? "hero-image visible" : "hero-image"}
              src={video.image}
              alt=""
            />
          ))}
          <div className="hero-shade" />
          <div className="hero-content">
            <p className="eyebrow">Selección de la semana</p>
            <h1>{current.title}</h1>
            <p className="hero-copy">
              Una historia sobre paisajes imposibles, memoria y la belleza de volver a empezar.
            </p>
            <div className="hero-actions">
              <Button
                className="primary-button"
                onClick={() => navigate({ name: "creator", creator: current.creator })}
              >
                <Icon name="play" /> Ver proyecto
              </Button>
              <span>Por {current.creator}</span>
            </div>
          </div>
          <div className="carousel-controls">
            <span>
              {String(slide + 1).padStart(2, "0")} / {String(featured.length).padStart(2, "0")}
            </span>
            <div>
              <Button
                className="circle-button previous"
                onClick={() => setSlide((slide - 1 + featured.length) % featured.length)}
                label="Anterior"
              >
                <Icon name="arrow" />
              </Button>
              <Button
                className="circle-button"
                onClick={() => setSlide((slide + 1) % featured.length)}
                label="Siguiente"
              >
                <Icon name="arrow" />
              </Button>
            </div>
          </div>
        </section>
      )}

      <section className="explore-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow dark">Recién publicados</p>
            <h2>Lo más reciente</h2>
          </div>
          <p>Estrenos de la comunidad seleccionados por fecha de publicación.</p>
        </div>
        <div className="recent-grid">
          {videosList.slice(0, 4).map((video, index) => (
            <Button
              className="recent-item"
              key={video.title}
              onClick={() => navigate({ name: "creator", creator: video.creator })}
            >
              <span className="recent-rank">0{index + 1}</span>
              <span className="recent-image">
                <img src={video.image} alt="" />
              </span>
              <span className="recent-copy">
                <strong>{video.title}</strong>
                <small>
                  {video.creator} · {video.year}
                </small>
              </span>
            </Button>
          ))}
        </div>
        <div className="filters">
          <Select
            label="Animación"
            value={filters.type}
            options={["Stop motion", "2D", "3D", "IA"]}
            onChange={update("type")}
          />
          <Select label="Género" value={filters.genre} options={genres} onChange={update("genre")} />
          <Select label="Año" value={filters.year} options={years} onChange={update("year")} />
          <Select
            label="Proyecto"
            value={filters.format}
            options={[
              "Cortometraje",
              "Largometraje",
              "Serie",
              "Tráiler",
              "Publicidad",
              "Musical",
              "Tutorial",
            ]}
            onChange={update("format")}
          />
        </div>
        <div className="results-bar">
          <span>
            <Icon name="grid" size={17} /> {filtered.length} proyectos
          </span>
          {Object.values(filters).some(Boolean) && (
            <Button
              className="clear-button"
              onClick={() => {
                setFilters({ type: "", genre: "", year: "", format: "" });
                setVisibleCount(8);
              }}
            >
              Limpiar filtros
            </Button>
          )}
        </div>
        <div className="video-grid">
          {filtered.slice(0, visibleCount).map((video) => (
            <VideoCard
              key={video.title}
              video={video}
              isAdmin={isAdmin}
              onDelete={() => onDeleteVideo(video.title)}
              onOpen={() => navigate({ name: "creator", creator: video.creator })}
            />
          ))}
        </div>
        {visibleCount < filtered.length && (
          <div className="load-more">
            <Button className="dark-button" onClick={() => setVisibleCount((count) => count + 8)}>
              Ver más
            </Button>
            <span>
              Mostrando {Math.min(visibleCount, filtered.length)} de {filtered.length}
            </span>
          </div>
        )}
        {!filtered.length && (
          <div className="empty">
            <p>No encontramos proyectos con estos filtros.</p>
            <Button
              className="text-button"
              onClick={() => {
                setFilters({ type: "", genre: "", year: "", format: "" });
                setVisibleCount(8);
              }}
            >
              Ver todos los proyectos
            </Button>
          </div>
        )}
      </section>
    </main>
  );
}

function AdminUploadModal({
  onClose,
  onAddVideo,
}: {
  onClose: () => void;
  onAddVideo: (newVideo: Video) => void;
}) {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [title, setTitle] = useState("");
  const [creator, setCreator] = useState("");
  const [type, setType] = useState("2D");
  const [genre, setGenre] = useState("Fantasía");
  const [format, setFormat] = useState("Cortometraje");
  const [duration, setDuration] = useState("10:00");

  const extractYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const videoId = extractYoutubeId(youtubeUrl);

    const image = videoId
      ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      : images.mountain;

    const newVideo: Video = {
      title,
      creator,
      image,
      duration,
      type,
      genre,
      year: String(new Date().getFullYear()),
      format,
      youtubeUrl,
    };

    onAddVideo(newVideo);
    onClose();
  };

  return (
    <div className="modal-layer" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
        <div className="modal-head">
          <div>
            <p className="eyebrow dark">Administración</p>
            <h2>Subir Nuevo Vídeo</h2>
          </div>
          <Button className="modal-close" onClick={onClose}>
            Cerrar
          </Button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
          <label className="field">
            <span>Enlace de YouTube</span>
            <input
              required
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
            />
          </label>

          <label className="field">
            <span>Título del Vídeo</span>
            <input
              required
              placeholder="Ej. Los Gigantes del Hielo"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>

          <label className="field">
            <span>Creador / Estudio</span>
            <input
              required
              placeholder="Ej. Luna Norte Studio"
              value={creator}
              onChange={(e) => setCreator(e.target.value)}
            />
          </label>

          <Select label="Técnica" value={type} options={["2D", "3D", "Stop motion", "IA"]} onChange={setType} />
          <Select label="Formato" value={format} options={["Cortometraje", "Serie", "Tráiler", "Musical"]} onChange={setFormat} />

          <label className="field">
            <span>Duración (mm:ss)</span>
            <input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="12:48" />
          </label>

          <Button className="dark-button" type="submit" style={{ marginTop: "1rem" }}>
            Publicar en la Web
          </Button>
        </form>
      </div>
    </div>
  );
}

function RegisterModal({ onClose }: { onClose: () => void }) {
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      onClose();
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
      alert("Error al conectar con Google.");
    }
  };

  return (
    <div className="modal-layer" onMouseDown={onClose}>
      <div className="modal auth-modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="brand-mark">
          <Icon name="spark" size={18} />
        </div>
        <p className="eyebrow dark">Únete a OnlyToons</p>
        <h2>Tu comunidad creativa, en un solo lugar.</h2>
        <p>Guarda proyectos, comenta y conecta con otros creadores sin gestionar una contraseña nueva.</p>
        <Button className="google-button" onClick={handleGoogleLogin}>
          <span>G</span> Continuar con Google
        </Button>
        <small>Al continuar, aceptas los términos y la política de privacidad.</small>
        <Button className="modal-close auth-close" onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </div>
  );
}

function CreatorPage({
  creator,
  navigate,
  videosList,
}: {
  creator: string;
  navigate: (view: View) => void;
  videosList: Video[];
}) {
  const projects = videosList.filter((video) => video.creator === creator);
  const lead = projects[0] ?? videosList[0];
  return (
    <main className="inner-page">
      <Button className="back-button" onClick={() => navigate({ name: "home" })}>
        <Icon name="arrow" /> Volver a explorar
      </Button>
      <section className="creator-hero">
        <div className="creator-copy">
          <p className="eyebrow dark">Creador destacado</p>
          <h1>{creator}</h1>
          <p>
            Estudio independiente que explora nuevas formas de narrar a través de la animación, la
            música y el diseño.
          </p>
          <div className="creator-stats">
            <span>
              <strong>{projects.length}</strong> proyectos
            </span>
            <span>
              <strong>24K</strong> seguidores
            </span>
          </div>
        </div>
        <div className="creator-portrait">
          <img src={lead.image} alt={`Trabajo de ${creator}`} />
        </div>
      </section>
      <section className="project-list">
        <div className="section-heading">
          <div>
            <p className="eyebrow dark">Filmografía</p>
            <h2>Proyectos</h2>
          </div>
        </div>
        <div className="video-grid">
          {projects.map((video) => (
            <VideoCard
              key={video.title}
              video={video}
              onOpen={() => navigate({ name: "project", creator, project: video.title })}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

function ProjectPage({
  creator,
  project,
  navigate,
  favorite,
  onToggleFavorite,
  videosList,
}: {
  creator: string;
  project: string;
  navigate: (view: View) => void;
  favorite: boolean;
  onToggleFavorite: () => void;
  videosList: Video[];
}) {
  const selected = videosList.find((video) => video.title === project) ?? videosList[0];
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(128);
  const [copied, setCopied] = useState(false);

  return (
    <main className="project-page">
      <section className="project-banner">
        <img src={selected.image} alt="" />
        <div className="hero-shade" />
        <Button className="back-on-dark" onClick={() => navigate({ name: "creator", creator })}>
          <Icon name="arrow" /> {creator}
        </Button>
        <div className="banner-copy">
          <p className="eyebrow">Serie original · {selected.year}</p>
          <h1>{project}</h1>
          <p>En los confines del mundo, un pequeño grupo descubre que cada recuerdo deja una huella.</p>
          <div className="banner-actions">
            <Button
              className="primary-button"
              onClick={() => {
                if (selected.youtubeUrl) window.open(selected.youtubeUrl, "_blank");
              }}
            >
              <Icon name="play" /> Ver en YouTube
            </Button>
            <Button
              className={liked ? "support-button liked" : "support-button"}
              onClick={() => {
                setLiked(!liked);
                setLikes((value) => value + (liked ? -1 : 1));
              }}
            >
              <Icon name="heart" /> {likes} Me gusta
            </Button>
            <Button
              className={favorite ? "support-button liked" : "support-button"}
              onClick={onToggleFavorite}
            >
              <Icon name="bookmark" /> {favorite ? "Guardado" : "Favorito"}
            </Button>
            <Button
              className="support-button"
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1800);
              }}
            >
              {copied ? "Enlace copiado" : "Compartir"}
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

function ProductsPage({ navigate }: { navigate: (view: View) => void }) {
  return (
    <main className="directory-page">
      <section className="directory-hero">
        <Button className="back-button" onClick={() => navigate({ name: "home" })}>
          <Icon name="arrow" /> Volver
        </Button>
        <p className="eyebrow dark">Recursos seleccionados</p>
        <h1>Herramientas para dar vida a tus ideas.</h1>
        <p>Software, hardware y materiales recomendados por artistas de la comunidad.</p>
      </section>
    </main>
  );
}

function CommunityPage({ navigate }: { navigate: (view: View) => void }) {
  return (
    <main className="directory-page community-page">
      <section className="directory-hero community-hero">
        <Button className="back-button" onClick={() => navigate({ name: "home" })}>
          <Icon name="arrow" /> Volver
        </Button>
        <div>
          <p className="eyebrow dark">Foro abierto</p>
          <h1>La comunidad hace avanzar las historias.</h1>
          <p>Pregunta, comparte procesos y encuentra colaboradores.</p>
        </div>
      </section>
    </main>
  );
}

function ProfilePage({
  user,
}: {
  navigate: (view: View) => void;
  user: User | null;
}) {
  return (
    <main className="profile-page">
      <section className="profile-cover">
        <div className="profile-avatar">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
          ) : (
            "US"
          )}
        </div>
        <div>
          <p className="eyebrow">Perfil de usuario</p>
          <h1>{user?.displayName || "Usuario registrado"}</h1>
          <p>{user?.email}</p>
        </div>
      </section>
    </main>
  );
}

export default function App() {
  const [view, setView] = useState<View>({ name: "home" });
  const [registerOpen, setRegisterOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [videosList, setVideosList] = useState<Video[]>(initialVideos);

  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate({ name: "home" });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const handleAddVideo = (newVideo: Video) => {
    setVideosList((prev) => [newVideo, ...prev]);
  };

  const handleDeleteVideo = (title: string) => {
    setVideosList((prev) => prev.filter((v) => v.title !== title));
  };

  const navigate = (next: View) => {
    setView(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="app">
      <Header
        navigate={navigate}
        onRegister={() => setRegisterOpen(true)}
        user={user}
        onLogout={handleLogout}
        videosList={videosList}
        onOpenAdminModal={() => setAdminModalOpen(true)}
      />
      {view.name === "home" && (
        <Home
          navigate={navigate}
          videosList={videosList}
          isAdmin={isAdmin}
          onDeleteVideo={handleDeleteVideo}
        />
      )}
      {view.name === "creator" && (
        <CreatorPage creator={view.creator} navigate={navigate} videosList={videosList} />
      )}
      {view.name === "project" && (
        <ProjectPage
          creator={view.creator}
          project={view.project}
          navigate={navigate}
          favorite={favorites.includes(view.project)}
          onToggleFavorite={() =>
            setFavorites((items) =>
              items.includes(view.project)
                ? items.filter((item) => item !== view.project)
                : [...items, view.project],
            )
          }
          videosList={videosList}
        />
      )}
      {view.name === "products" && <ProductsPage navigate={navigate} />}
      {view.name === "community" && <CommunityPage navigate={navigate} />}
      {view.name === "profile" && <ProfilePage navigate={navigate} user={user} />}
      {registerOpen && <RegisterModal onClose={() => setRegisterOpen(false)} />}
      {adminModalOpen && (
        <AdminUploadModal
          onClose={() => setAdminModalOpen(false)}
          onAddVideo={handleAddVideo}
        />
      )}
      <footer>
        <span>ONLYTOONS</span>
        <p>Historias que cobran vida.</p>
        <small>© 2026 OnlyToons Studio</small>
      </footer>
    </div>
  );
}
