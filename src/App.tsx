import { useEffect, useState, useRef, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
// @ts-ignore
import * as random from 'maath/random/dist/maath-random.esm';

// --- Types ---
interface Paper {
  authors: string;
  title: string;
  venue: string;
  year: string;
  link: string | null;
}

// --- Interactive 3D Background ---

function Stars() {
  const ref = useRef<any>(null);
  const [sphere] = useState(() => random.inSphere(new Float32Array(5000), { radius: 1.5 }));
  
  useFrame((_state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#64CCC9"
          size={0.005}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
}

// --- Components ---

const GlassWindow = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 1.05 }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    className={`glass-window ${className}`}
  >
    {children}
  </motion.div>
);

// --- Page Components ---

const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <div className="landing-layout">
      <div className="landing-bg">
        <Canvas camera={{ position: [0, 0, 1] }}>
          <Stars />
        </Canvas>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="hero-content"
      >
        <p className="eyebrow">Materials Science & AI Lab</p>
        <h1 className="main-slogan">
          Harnessing AI to <br />
          <span>Revolutionize</span> Materials Science
        </h1>
        <p className="sub-slogan">
          Discovering the next generation of materials through intelligent <br />
          computation and autonomous experimentation.
        </p>

        <div className="landing-menu-grid">
          <motion.div 
            whileHover={{ y: -10, scale: 1.02 }}
            onClick={() => navigate('/profile')}
            className="menu-card glass"
          >
            <span className="menu-icon">○</span>
            <h3>Profile</h3>
            <p>Career, Research Philosophy & Academic Journey</p>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -10, scale: 1.02 }}
            onClick={() => navigate('/research')}
            className="menu-card glass"
          >
            <span className="menu-icon">□</span>
            <h3>Research</h3>
            <p>Active Projects & Future Scientific Visions</p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -10, scale: 1.02 }}
            onClick={() => navigate('/publications')}
            className="menu-card glass"
          >
            <span className="menu-icon">△</span>
            <h3>Publications</h3>
            <p>Peer-reviewed Journals & Conference Papers</p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -10, scale: 1.02 }}
            onClick={() => navigate('/news')}
            className="menu-card glass"
          >
            <span className="menu-icon">◇</span>
            <h3>News</h3>
            <p>Latest Updates, Seminars & Lab Activities</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

const AboutPage = ({ content }: { content: string }) => {
  const introEndIdx = content.indexOf('## Education');
  const introPart = introEndIdx !== -1 ? content.substring(0, introEndIdx) : content;
  const restPart = introEndIdx !== -1 ? content.substring(introEndIdx) : '';
  
  const careerSplit = restPart.split('## Career');
  const educationPart = careerSplit[0];
  const careerPart = careerSplit[1] ? '## Career' + careerSplit[1] : '';

  return (
    <GlassWindow>
      <div className="about-layout">
        <div className="profile-header-grid">
          <section className="cv-intro markdown">
            {/* Filter out images from the intro markdown to prevent duplication */}
            <ReactMarkdown components={{ img: () => null }}>{introPart}</ReactMarkdown>
          </section>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="profile-image-container"
          >
            <img 
              src="/images/박양정_민증.jpg" 
              alt="Professor Yangjeong Park" 
              className="profile-image-frame"
            />
            <div className="profile-image-decoration"></div>
          </motion.div>
        </div>

        <div className="profile-details-grid">
          <section className="cv-section markdown">
            <ReactMarkdown>{educationPart}</ReactMarkdown>
          </section>
          {careerPart && (
            <section className="career-section markdown">
              <ReactMarkdown>{careerPart}</ReactMarkdown>
            </section>
          )}
        </div>
      </div>
    </GlassWindow>
  );
};

const ResearchPage = ({ content }: { content: string }) => (
  <GlassWindow><div className="research-layout markdown"><ReactMarkdown>{content}</ReactMarkdown></div></GlassWindow>
);

// --- Helper: Publication Parser ---
function parsePublications(md: string): Paper[] {
  const text = md.replace(/&dagger;/g, '†').replace(/&ast;/g, '*');
  const listItems = text.split(/\n(?=\d+\.\s+)/);
  const papers: Paper[] = [];

  listItems.forEach(item => {
    const match = item.trim().match(/^(\d+)\.\s+([\s\S]+)$/);
    if (!match) return;

    const clean = match[2].trim();
    const titleMatch = clean.match(/\*\*"(.+?)"\*\*/) || clean.match(/\*\*(.+?)\*\*/) || clean.match(/"\*\*(.+?)\*\*"/);
    const title = titleMatch ? titleMatch[1] : 'Untitled';
    const titleRaw = titleMatch ? titleMatch[0] : '';
    const titleIdx = clean.indexOf(titleRaw);
    let authors = titleIdx > -1 ? clean.substring(0, titleIdx).trim() : '';
    authors = authors.replace(/[",\s]+$/, '');
    const rest = titleIdx > -1 ? clean.substring(titleIdx + titleRaw.length).trim() : '';
    const venueMatch = rest.match(/\*([^*]+)\*/);
    const venue = venueMatch ? venueMatch[1] : '';
    const yearMatch = rest.match(/\((\d{4})\)/);
    const year = yearMatch ? yearMatch[1] : '';
    const linkMatch = rest.match(/\[\[.*?\]\]\((.*?)\)/) || rest.match(/\[.*?\]\((.*?)\)/);
    const link = linkMatch ? linkMatch[1] : null;
    papers.push({ authors, title, venue, year, link });
  });

  return papers;
}

const PublicationsPage = ({ content }: { content: string }) => {
  const papers = useMemo(() => parsePublications(content), [content]);
  const firstItemIdx = content.search(/^\d+\.\s+/m);
  const headerText = firstItemIdx !== -1 
    ? content.substring(0, firstItemIdx).replace('# Publications', '').trim()
    : '';

  return (
    <GlassWindow>
      <div className="publications-container">
        <header className="pub-page-header">
          <h1 className="newsreader-title">Publications</h1>
          {headerText && (
            <div className="publication-legend">
              <ReactMarkdown>{headerText}</ReactMarkdown>
            </div>
          )}
        </header>

        <div className="publication-grid">
          {papers.map((paper: Paper, idx: number) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.01, 0.5), duration: 0.4 }}
              whileHover={{ y: -8, scale: 1.01 }}
              className="publication-card glass"
            >
              <div className="pub-year-badge">{paper.year}</div>
              <h3 className="pub-title">{paper.title}</h3>
              <div className="pub-authors">
                <ReactMarkdown components={{ p: ({node, ...props}) => <span {...props} /> }}>
                  {paper.authors}
                </ReactMarkdown>
              </div>
              <div className="pub-footer">
                <span className="pub-venue">{paper.venue}</span>
                {paper.link && (
                  <a href={paper.link} target="_blank" rel="noreferrer" className="pub-link-btn">
                    View Paper
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </GlassWindow>
  );
};

const NewsPage = ({ content }: { content: string }) => (
  <GlassWindow><div className="news-layout markdown"><ReactMarkdown>{content}</ReactMarkdown></div></GlassWindow>
);

// --- Main App ---

function AppContent() {
  const [data, setData] = useState({ about: '', research: '', publications: '', posts: '' });
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);
  const isLanding = location.pathname === '/';

  useEffect(() => {
    const isDark = localStorage.getItem('prof-site-theme') === 'dark';
    setDarkMode(isDark);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('prof-site-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const [about, research, publications, posts] = await Promise.all([
          fetch('/content/about.md').then(r => r.text()),
          fetch('/content/research.md').then(r => r.text()),
          fetch('/content/publications.md').then(r => r.text()),
          fetch('/content/all_posts.md').then(r => r.text()),
        ]);
        setData({ about, research, publications, posts });
      } catch (error) {
        console.error('Failed to load content', error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  if (loading) return <div className="loading-screen">...</div>;

  return (
    <div className={`app-shell ${isLanding ? 'is-landing' : ''}`}>
      <AnimatePresence>
        {!isLanding && (
          <motion.nav 
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            className="side-nav glass"
          >
            <div className="nav-brand">
              <NavLink to="/" className="brand-link">
                <div className="brand-dot"></div>
                <span>MSAIL</span>
              </NavLink>
            </div>
            <div className="nav-links">
              <NavLink to="/profile" className={({ isActive }) => (isActive ? 'active' : '')}>
                <span className="nav-icon">○</span> Profile
              </NavLink>
              <NavLink to="/research" className={({ isActive }) => (isActive ? 'active' : '')}>
                <span className="nav-icon">□</span> Research
              </NavLink>
              <NavLink to="/publications" className={({ isActive }) => (isActive ? 'active' : '')}>
                <span className="nav-icon">△</span> Publications
              </NavLink>
              <NavLink to="/news" className={({ isActive }) => (isActive ? 'active' : '')}>
                <span className="nav-icon">◇</span> News
              </NavLink>
            </div>
            <div className="nav-footer">
              <button onClick={() => setDarkMode(!darkMode)} className="theme-toggle">
                {darkMode ? '🌙' : '☀️'}
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      <main className="main-viewport">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/profile" element={<AboutPage content={data.about} />} />
            <Route path="/research" element={<ResearchPage content={data.research} />} />
            <Route path="/publications" element={<PublicationsPage content={data.publications} />} />
            <Route path="/news" element={<NewsPage content={data.posts} />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
