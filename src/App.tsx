import { useEffect, useState, useRef, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
// @ts-ignore
import * as random from 'maath/random/dist/maath-random.esm';
import { User, FlaskConical, BookOpen, Newspaper, Sun, Moon } from 'lucide-react';

// --- Types ---
interface Paper {
  number: string;
  authors: string;
  title: string;
  venue: string;
  year: string;
  link: string | null;
}

interface LabMember {
  name: string;
  image: string;
  email: string;
}

interface MemberGroup {
  title: string;
  members: LabMember[];
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

const GlobalFooter = () => (
  <footer className="global-footer">
    <img 
      src="/images/logo_solid_navy.png"
      alt="UNIST Logo" 
      className="footer-logo"
    />
    <p>© {new Date().getFullYear()} Scientific AI Lab. All rights reserved.</p>
  </footer>
);

const GlassWindow = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 1.05 }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    className={`glass-window ${className}`}
  >
    <div className="glass-content-wrapper">
      {children}
      <GlobalFooter />
    </div>
  </motion.div>
);

// --- Page Components ---

const LandingPage = ({ darkMode, onToggleTheme }: { darkMode: boolean; onToggleTheme: () => void }) => {
  const navigate = useNavigate();
  const logoSrc = darkMode ? "/images/logo_simple_white.png" : "/images/logo_simple_navy.png";
  
  return (
    <div className="landing-layout">
      <header className="landing-header">
        <div className="landing-brand">
          <img src={logoSrc} className="landing-logo" alt="UNIST Logo" />
          <div className="brand-separator"></div>
          <div className="brand-text-stack">
            <span className="brand-sail">SAIL</span>
            <span className="brand-full-name">Scientific AI Lab</span>
          </div>
        </div>
        <button onClick={onToggleTheme} className="theme-toggle landing-theme-toggle" aria-label="Toggle theme">
          {darkMode ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </header>

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
        <h1 className="main-slogan">
          AI-Driven <br />
          Orchestration of <br />
          <span>Scientific</span> Research
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
            <span className="menu-icon"><User size={28} /></span>
            <h3>Profile</h3>
            <p>Career, Research Philosophy & Academic Journey</p>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -10, scale: 1.02 }}
            onClick={() => navigate('/research')}
            className="menu-card glass"
          >
            <span className="menu-icon"><FlaskConical size={28} /></span>
            <h3>Research</h3>
            <p>Active Projects & Future Scientific Visions</p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -10, scale: 1.02 }}
            onClick={() => navigate('/publications')}
            className="menu-card glass"
          >
            <span className="menu-icon"><BookOpen size={28} /></span>
            <h3>Publications</h3>
            <p>Peer-reviewed Journals & Conference Papers</p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -10, scale: 1.02 }}
            onClick={() => navigate('/news')}
            className="menu-card glass"
          >
            <span className="menu-icon"><Newspaper size={28} /></span>
            <h3>News</h3>
            <p>Latest Updates, Seminars & Lab Activities</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

function parseAboutContent(content: string) {
  const lines = content.split('\n');
  const cvLines: string[] = [];
  const groups: MemberGroup[] = [];
  let currentGroup: MemberGroup | null = null;
  let currentMember: LabMember | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const isMemberGroupHeader = line.startsWith('## ') && !line.toLowerCase().includes('principal investigator');
    
    if (isMemberGroupHeader) {
      currentGroup = { title: line.substring(3).trim(), members: [] };
      groups.push(currentGroup);
      currentMember = null;
    } else if (currentGroup) {
      if (line.startsWith('### ')) {
        currentMember = { name: line.substring(4).trim(), image: '', email: '' };
        currentGroup.members.push(currentMember);
      } else if (currentMember) {
        const imgMatch = line.match(/^!\[(.*?)\]\((.*?)\)/);
        if (imgMatch) {
          currentMember.image = imgMatch[2];
        } else if (line.includes('@')) {
          currentMember.email = line;
        }
      }
    } else {
      cvLines.push(lines[i]);
    }
  }

  const cvContent = cvLines.join('\n');
  const educationIdx = cvContent.indexOf('### Education');
  const experienceIdx = cvContent.indexOf('### Professional Experience');
  
  const introEndIdx = educationIdx !== -1 ? educationIdx : cvContent.length;
  const introPart = cvContent.substring(0, introEndIdx);
  
  const educationPart = educationIdx !== -1 ? 
    cvContent.substring(educationIdx, experienceIdx !== -1 ? experienceIdx : cvContent.length) : '';
    
  const experiencePart = experienceIdx !== -1 ? cvContent.substring(experienceIdx) : '';

  return { introPart, educationPart, experiencePart, groups };
}

const AboutPage = ({ content }: { content: string }) => {
  const { introPart, educationPart, experiencePart, groups } = useMemo(() => parseAboutContent(content), [content]);

  // For the PI section, we want to extract the image, name, and affiliation to build a custom card
  // Since we are parsing markdown, we'll try to extract them, but fallback to rendering as markdown if it fails
  const imgMatch = introPart.match(/!\[.*?\]\((.*?)\)/);
  const imgSrc = imgMatch ? imgMatch[1] : "/images/박양정_민증.jpg";
  
  const piTitleMatch = introPart.match(/##\s+(.*)/);
  const piTitle = piTitleMatch ? piTitleMatch[1] : "Principal Investigator";

  // Extracting name (starts with ### )
  const nameMatch = introPart.match(/###\s+(.*)/);
  const name = nameMatch ? nameMatch[1] : "Yang Jeong Park, Ph.D.";
  
  // Try to remove the image and name from introPart to get the affiliation/quote
  let affiliationPart = introPart;
  if (imgMatch) affiliationPart = affiliationPart.replace(imgMatch[0], '');
  if (nameMatch) affiliationPart = affiliationPart.replace(nameMatch[0], '');
  if (piTitleMatch) affiliationPart = affiliationPart.replace(piTitleMatch[0], '');
  affiliationPart = affiliationPart.replace('# Profile', '').trim();

  return (
    <GlassWindow>
      <div className="about-layout">
        <h1 className="newsreader-title" style={{ marginBottom: '2rem' }}>Profile</h1>
        <div className="member-group-section">
          <h2 className="newsreader-title" style={{ fontSize: '2.2rem', marginBottom: '2rem' }}>{piTitle}</h2>
          <div className="profile-grid">
            {/* Left Column: Profile Card */}
            <div className="profile-card glass">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="profile-card-image"
              >
                <img 
                  src={imgSrc} 
                  alt={name} 
                />
                <div className="profile-image-decoration"></div>
              </motion.div>
              <div className="profile-card-info markdown">
                <h2 style={{ borderBottom: 'none', paddingBottom: 0, marginTop: '1rem', textAlign: 'center' }}>{name}</h2>
                <div className="profile-affiliation">
                  <ReactMarkdown components={{ img: () => null }}>{affiliationPart}</ReactMarkdown>
                </div>
              </div>
            </div>

            {/* Right Column: Details */}
            <div className="profile-details">
              {educationPart && (
                <motion.section 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="cv-section markdown"
                >
                  <ReactMarkdown>{educationPart}</ReactMarkdown>
                </motion.section>
              )}
              
              {experiencePart && (
                <motion.section 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="cv-section markdown" 
                  style={{ marginTop: '2.5rem' }}
                >
                  <ReactMarkdown>{experiencePart}</ReactMarkdown>
                </motion.section>
              )}
            </div>
          </div>
        </div>

        {/* Member Groups */}
        {groups.map((group, gIdx) => (
          <div key={gIdx} className="member-group-section" style={{ marginTop: '4rem', paddingTop: '3rem', borderTop: '1px solid var(--line-soft)' }}>
            <h2 className="newsreader-title" style={{ fontSize: '2.2rem', marginBottom: '2rem' }}>{group.title}</h2>
            <div className="member-grid">
              {group.members.map((member, mIdx) => (
                <motion.div 
                  key={mIdx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: mIdx * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="member-card glass"
                >
                  <div className="member-card-image">
                    {member.image ? (
                      <img src={member.image} alt={member.name} />
                    ) : (
                      <div className="member-placeholder"><User size={48} /></div>
                    )}
                  </div>
                  <div className="member-card-info">
                    <h3>{member.name}</h3>
                    {member.email && <p className="member-email">{member.email}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}

        {/* Location Section */}
        <section className="location-section markdown" style={{ borderTop: '1px solid var(--line-soft)', paddingTop: '3rem', marginTop: '3rem' }}>
          <h2>Location</h2>
          <p>Rm 401-2, Bldg 102, 50 UNIST-gil, Ulju-gun, Ulsan, 44919, Republic of Korea</p>
          <div className="map-container" style={{ marginTop: '1.5rem', borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--line-soft)', boxShadow: '0 10px 30px rgba(0, 58, 112, 0.1)' }}>
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3243.9142104085427!2d129.18903171525492!3d35.57245998022019!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x35661026db7811f7%3A0xd68b2dc1c0f06d3e!2z7Jq47IKw6rO87ZWZ6riw7Iig7JuQ!5e0!3m2!1sko!2skr!4v1700000000000!5m2!1sko!2skr" 
              width="100%" 
              height="350" 
              style={{ border: 0, display: 'block' }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="UNIST Location"
            ></iframe>
          </div>
        </section>
      </div>
    </GlassWindow>
  );
};

interface ResearchTopic {
  title: string;
  image: string;
  imageAlt: string;
  description: string;
}

function parseResearchContent(md: string) {
  const sections = md.split('---').map(s => s.trim()).filter(s => s);
  const intro = sections[0] || '';
  const topics: ResearchTopic[] = [];

  for (let i = 1; i < sections.length; i++) {
    const section = sections[i];
    const lines = section.split('\n');
    let title = '';
    let image = '';
    let imageAlt = '';
    const descLines: string[] = [];

    for (const line of lines) {
      const t = line.trim();
      if (t.startsWith('### ')) {
        title = t.replace('### ', '');
      } else if (t.startsWith('![') && t.includes('](')) {
        const match = t.match(/^!\[(.*?)\]\((.*?)\)/);
        if (match) {
          imageAlt = match[1];
          image = match[2];
        }
      } else {
        descLines.push(line);
      }
    }
    topics.push({ title, image, imageAlt, description: descLines.join('\n').trim() });
  }

  return { intro, topics };
}

const ResearchPage = ({ content }: { content: string }) => {
  const { intro, topics } = useMemo(() => parseResearchContent(content), [content]);

  return (
    <GlassWindow>
      <div className="research-container">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="research-intro markdown"
        >
          <ReactMarkdown>{intro}</ReactMarkdown>
        </motion.div>

        <div className="research-topics">
          {topics.map((topic, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className={`research-topic-card ${isEven ? 'row-normal' : 'row-reverse'}`}
              >
                <div className="topic-image-wrapper">
                  <div className="topic-image-container glass">
                    {topic.image ? (
                      <img src={topic.image} alt={topic.imageAlt} />
                    ) : (
                      <div className="topic-placeholder"><FlaskConical size={48} /></div>
                    )}
                  </div>
                </div>
                <div className="topic-content markdown">
                  <h2 style={{ marginTop: 0 }}>{topic.title}</h2>
                  <ReactMarkdown>{topic.description}</ReactMarkdown>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </GlassWindow>
  );
};

function parsePublications(md: string): Paper[] {
  const text = md.replace(/&dagger;/g, '†').replace(/&ast;/g, '*');
  const listItems = text.split(/\n(?=\d+\.\s+)/);
  const papers: Paper[] = [];
  listItems.forEach(item => {
    const match = item.trim().match(/^(\d+)\.\s+([\s\S]+)$/);
    if (!match) return;
    const number = match[1];
    const clean = match[2].trim();
    const titleMatch = clean.match(/\*\*"(.+?)"\*\*/) || clean.match(/\*\*(.+?)\*\*/) || clean.match(/"\*\*(.+?)\*\*"/);
    const title = titleMatch ? titleMatch[1] : 'Untitled';
    const titleRaw = titleMatch ? titleMatch[0] : '';
    const titleIdx = clean.indexOf(titleRaw);
    let authors = titleIdx > -1 ? clean.substring(0, titleIdx).trim() : '';
    authors = authors.replace(/[",\s]+$/, '');
    let rest = titleIdx > -1 ? clean.substring(titleIdx + titleRaw.length).trim() : '';
    rest = rest.replace(/^[".,\s]+/, '');
    const linkMatch = rest.match(/\[\[.*?\]\]\((.*?)\)/) || rest.match(/\[.*?\]\((.*?)\)/);
    const link = linkMatch ? linkMatch[1] : null;
    if (linkMatch) rest = rest.replace(linkMatch[0], '').trim();
    const yearMatch = rest.match(/\((\d{4})\)/);
    const year = yearMatch ? yearMatch[1] : '';
    if (yearMatch) rest = rest.replace(yearMatch[0], '').trim();
    const venue = rest.replace(/[.,\s]+$/, '');
    papers.push({ number, authors, title, venue, year, link });
  });
  return papers;
}

const PublicationsPage = ({ content }: { content: string }) => {
  const papers = useMemo(() => parsePublications(content), [content]);
  const firstItemIdx = content.search(/^\d+\.\s+/m);
  const headerText = firstItemIdx !== -1 ? content.substring(0, firstItemIdx).replace('# Publications', '').trim() : '';
  return (
    <GlassWindow>
      <div className="publications-container">
        <header className="pub-page-header">
          <h1 className="newsreader-title">Publications</h1>
          {headerText && <div className="publication-legend"><ReactMarkdown>{headerText}</ReactMarkdown></div>}
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
              <h3 className="pub-title">{paper.number}. {paper.title}</h3>
              <div className="pub-authors">
                <ReactMarkdown components={{ p: ({node, ...props}) => <span {...props} /> }}>{paper.authors}</ReactMarkdown>
              </div>
              <div className="pub-footer">
                <span className="pub-venue">
                  <ReactMarkdown components={{ p: ({node, ...props}) => <span {...props} /> }}>{paper.venue}</ReactMarkdown>
                </span>
                {paper.link && <a href={paper.link} target="_blank" rel="noreferrer" className="pub-link-btn">View Paper</a>}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </GlassWindow>
  );
};

interface NewsPost {
  title: string;
  images: { alt: string, src: string }[];
  date: string;
  content: string;
}

function parseNews(md: string): NewsPost[] {
  const sections = md.split('---').map(s => s.trim()).filter(s => s);
  const posts: NewsPost[] = [];
  
  for (const section of sections) {
    if (!section.startsWith('## ')) continue;
    
    const lines = section.split('\n');
    const titleMatch = lines[0].match(/^##\s+(.*)/);
    const title = titleMatch ? titleMatch[1] : '';
    
    const images: { alt: string, src: string }[] = [];
    let date = '';
    const contentLines: string[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      const imgMatch = line.match(/^!\[(.*?)\]\((.*?)\)/);
      if (imgMatch) {
        images.push({ alt: imgMatch[1], src: imgMatch[2] });
        continue;
      }
      const dateMatch = line.match(/^\*\*Date:\s*(.*?)\*\*/);
      if (dateMatch) {
        date = dateMatch[1];
        continue;
      }
      if (line !== '') {
        contentLines.push(line);
      }
    }
    posts.push({ title, images, date, content: contentLines.join('\n\n') });
  }
  return posts;
}

const NewsPage = ({ content }: { content: string }) => {
  const posts = useMemo(() => parseNews(content), [content]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <GlassWindow>
      <div className="news-container">
        <header className="news-page-header">
          <h1 className="newsreader-title">News</h1>
        </header>
        <div className="news-grid">
          {posts.map((post, idx) => {
            const isExpanded = expandedIndex === idx;
            return (
              <motion.div
                key={idx}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={`news-card glass ${isExpanded ? 'expanded' : ''}`}
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
              >
                {post.images.length > 0 && (
                  <motion.div layout className="news-card-image">
                    <img 
                      src={post.images[0].src} 
                      alt={post.images[0].alt} 
                    />
                  </motion.div>
                )}
                <motion.div layout className="news-card-content">
                  <h3>{post.title}</h3>
                  <div className="news-date">{post.date}</div>
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="news-expanded-content markdown"
                      >
                        <ReactMarkdown>{post.content}</ReactMarkdown>
                        {post.images.length > 1 && (
                          <div className="news-extra-images">
                            {post.images.slice(1).map((img, i) => (
                              <img key={i} src={img.src} alt={img.alt} />
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </GlassWindow>
  );
};

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
          fetch('content/about.md').then(r => r.text()),
          fetch('content/research.md').then(r => r.text()),
          fetch('content/publications.md').then(r => r.text()),
          fetch('content/all_posts.md').then(r => r.text()),
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

  const logoSrc = darkMode ? "/images/logo_simple_white.png" : "/images/logo_simple_navy.png";

  if (loading) return <div className="loading-screen"><div className="loading-spinner"></div></div>;

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
                <img src={logoSrc} className="nav-logo" alt="UNIST Logo" />
                <div className="brand-separator small"></div>
                <span className="brand-sail-nav">SAIL</span>
              </NavLink>
            </div>
            <div className="nav-links">
              <NavLink to="/profile" className={({ isActive }) => (isActive ? 'active' : '')}>
                <span className="nav-icon"><User size={18} /></span> Profile
              </NavLink>
              <NavLink to="/research" className={({ isActive }) => (isActive ? 'active' : '')}>
                <span className="nav-icon"><FlaskConical size={18} /></span> Research
              </NavLink>
              <NavLink to="/publications" className={({ isActive }) => (isActive ? 'active' : '')}>
                <span className="nav-icon"><BookOpen size={18} /></span> Publications
              </NavLink>
              <NavLink to="/news" className={({ isActive }) => (isActive ? 'active' : '')}>
                <span className="nav-icon"><Newspaper size={18} /></span> News
              </NavLink>
            </div>
            <div className="nav-footer">
              <button onClick={() => setDarkMode(!darkMode)} className="theme-toggle">
                {darkMode ? <Moon size={20} /> : <Sun size={20} />}
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      <main className="main-viewport">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<LandingPage darkMode={darkMode} onToggleTheme={() => setDarkMode(!darkMode)} />} />
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
