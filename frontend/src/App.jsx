import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Leaf, BookOpen, User, Menu, X, 
  ChevronRight, CheckCircle, Lock, Award, 
  Target, Zap, Trophy, TrendingUp, LogOut
} from 'lucide-react';
import axios from 'axios';

// --- Uber Design System Utilities ---
// Following the 60-30-10 rule: 
// 60% Neutral (White/Light Gray), 30% Secondary (Black/Dark Gray), 10% Primary (Green)

const API = {
  login: '/api/login',
  user: (id) => `/api/user/${id}`,
  jobs: '/api/jobs',
  courses: '/api/courses',
  lifeActions: '/api/life-actions',
  logAction: (id) => `/api/user/${id}/action`,
  init: '/api/init',
  parseResume: '/api/parse-resume',
  updateUser: (id) => `/api/user/${id}/update`
};

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('login'); // login, home, jobs, life, learn, profile
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Data State
  const [jobs, setJobs] = useState([]);
  const [courses, setCourses] = useState([]);
  const [lifeActions, setLifeActions] = useState({});
  const [userData, setUserData] = useState(null);
  
  // Resume Parser State
  const [resumeText, setResumeText] = useState('');
  const [parsingResume, setParsingResume] = useState(false);

  useEffect(() => {
    // Initialize DB on first load (demo purposes)
    axios.post(API.init);
  }, []);

  useEffect(() => {
    if (user && user.id) {
      refreshUserData();
      fetchJobs();
      fetchCourses();
      fetchLifeActions();
    }
  }, [user]);

  const refreshUserData = async () => {
    try {
      const res = await axios.get(API.user(user.id));
      setUserData(res.data);
      // Also refresh jobs to update matches based on new data
      fetchJobs(); 
    } catch (err) {
      console.error("Failed to refresh user data", err);
    }
  };

  const fetchJobs = async () => {
    try {
      if (!user?.id) return;
      const res = await axios.get(`${API.jobs}?user_id=${user.id}`);
      setJobs(res.data);
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await axios.get(API.courses);
      setCourses(res.data);
    } catch (err) {
      console.error("Failed to fetch courses", err);
    }
  };

  const fetchLifeActions = async () => {
    try {
      const res = await axios.get(API.lifeActions);
      setLifeActions(res.data);
    } catch (err) {
      console.error("Failed to fetch life actions", err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const email = e.target.email.value;
    const name = e.target.name.value;
    
    try {
      const res = await axios.post(API.login, { email, name });
      setUser(res.data);
      setUserData(res.data); // Initial set
      setActiveTab('home');
    } catch (err) {
      alert("Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setUserData(null);
    setActiveTab('login');
  };

  const handleLogAction = async (action, category) => {
    try {
      await axios.post(API.logAction(user.id), { ...action, category });
      await refreshUserData(); // Refresh points and matches
      alert(`Action logged! You earned ${action.points} points.`);
    } catch (err) {
      console.error("Failed to log action", err);
    }
  };
  
  const handleParseResume = async () => {
    if (!resumeText.trim()) return;
    setParsingResume(true);
    try {
      const res = await axios.post(API.parseResume, { text: resumeText });
      const newSkills = res.data.skills;
      
      if (newSkills.length === 0) {
        alert("No relevant skills found. Try adding keywords like 'Python', 'Solar', 'Management'.");
      } else {
        // Merge with existing
        const currentSkills = userData.skills || [];
        const uniqueSkills = [...new Set([...currentSkills, ...newSkills])];
        
        // Update user
        await axios.post(API.updateUser(user.id), { skills: uniqueSkills });
        await refreshUserData();
        alert(`Success! Added skills: ${newSkills.join(', ')}`);
        setResumeText('');
      }
    } catch (err) {
      console.error("Resume parse failed", err);
      alert("Failed to analyze resume.");
    } finally {
      setParsingResume(false);
    }
  };

  // --- Components ---

  const LoginScreen = () => (
    <div className="min-h-screen flex items-center justify-center bg-uber-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full border border-gray-200">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-uber-black text-white rounded-full flex items-center justify-center mx-auto mb-4">
            <Leaf size={32} />
          </div>
          <h1 className="text-2xl font-bold mb-2">Green Career Platform</h1>
          <p className="text-gray-500">Your gateway to India's net-zero workforce.</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input type="text" name="name" required className="w-full px-4 py-3 rounded-lg bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-black transition-all" placeholder="Enter your name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" name="email" required className="w-full px-4 py-3 rounded-lg bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-black transition-all" placeholder="name@example.com" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center">
            {loading ? "Signing in..." : "Get Started"} <ChevronRight size={18} className="ml-2" />
          </button>
        </form>
        <p className="mt-6 text-xs text-center text-gray-400">
          Integrated with Mission LiFE & NPTEL
        </p>
      </div>
    </div>
  );

  const StatCard = ({ icon: Icon, label, value, subtext, highlight }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">{label}</p>
          <h3 className="text-3xl font-bold">{value}</h3>
        </div>
        <div className={`p-3 rounded-full ${highlight ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
          <Icon size={24} />
        </div>
      </div>
      {subtext && <p className="text-xs text-gray-400">{subtext}</p>}
    </div>
  );

  const JobCard = ({ job }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-4 hover:border-black transition-colors group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold group-hover:text-green-600 transition-colors">{job.title}</h3>
          <p className="text-sm text-gray-500">{job.sector}</p>
        </div>
        <div className="text-right">
          <span className={`text-xl font-bold ${job.match > 80 ? 'text-green-600' : 'text-yellow-500'}`}>{job.match}%</span>
          <p className="text-xs text-gray-400">Match</p>
        </div>
      </div>
      
      <p className="text-gray-600 text-sm mb-4">{job.description}</p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {job.matchedSkills.map(s => (
          <span key={s} className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-md">{s}</span>
        ))}
        {job.missingSkills.map(s => (
          <span key={s} className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded-md">Missing: {s}</span>
        ))}
      </div>
      
      {/* Smart Recommendations */}
      {job.recommended_courses && job.recommended_courses.length > 0 && (
        <div className="mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
          <p className="text-xs font-bold text-blue-700 mb-2 flex items-center"><Zap size={12} className="mr-1"/> Recommended to boost match:</p>
          <div className="space-y-2">
            {job.recommended_courses.map(course => (
               <div key={course.id} className="flex justify-between items-center bg-white p-2 rounded border border-blue-100">
                  <span className="text-xs font-medium">{course.title}</span>
                  <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">+{course.life_points_reward} Pts</span>
               </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-t pt-4 mt-2">
        <div className="flex items-center gap-2">
           {job.meetsLifeRequirement ? (
             <div className="flex items-center text-green-600 text-xs font-bold">
               <CheckCircle size={14} className="mr-1"/> Unlocked
             </div>
           ) : (
             <div className="flex items-center text-gray-400 text-xs">
               <Lock size={14} className="mr-1"/> Needs {job.lifePointsNeeded} LiFE Pts
             </div>
           )}
           {job.is_govt_role && <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded ml-2">Govt. Role</span>}
        </div>
        <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${job.meetsLifeRequirement ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
          Apply Now
        </button>
      </div>
    </div>
  );

  if (!user || activeTab === 'login') return <LoginScreen />;

  return (
    <div className="min-h-screen bg-uber-gray-100 flex font-sans">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-black text-white transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black">
              <Leaf size={16} />
            </div>
            <span className="font-bold text-lg">Green Career</span>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'home', label: 'Dashboard', icon: TrendingUp },
              { id: 'jobs', label: 'Find Jobs', icon: Briefcase },
              { id: 'life', label: 'Mission LiFE', icon: Leaf },
              { id: 'learn', label: 'Learning', icon: BookOpen },
              { id: 'profile', label: 'Profile', icon: User },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === item.id ? 'bg-white text-black' : 'text-gray-400 hover:text-white hover:bg-gray-900'}`}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="absolute bottom-6 left-6 right-6">
          <button onClick={handleLogout} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 hover:bg-gray-100 rounded-lg">
              <Menu size={20} />
            </button>
            <h2 className="text-xl font-bold capitalize">{activeTab}</h2>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden md:flex flex-col items-end mr-2">
               <span className="text-sm font-bold">{user.name}</span>
               <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{userData?.badge_level || 'Beginner'}</span>
             </div>
             <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600">
               <User size={20} />
             </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'home' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <StatCard icon={Leaf} label="LiFE Points" value={userData?.life_points || 0} subtext="Keep it up!" highlight />
                 <StatCard icon={Briefcase} label="Job Matches" value={jobs.filter(j => j.match > 60).length} subtext=">60% Match" />
                 <StatCard icon={Target} label="Skills" value={userData?.skills?.length || 0} subtext="Verified" />
                 <StatCard icon={Award} label="Impact" value={`${((userData?.life_points || 0) * 0.05).toFixed(1)}t`} subtext="CO2 Saved" />
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg">Recommended Jobs</h3>
                    <button onClick={() => setActiveTab('jobs')} className="text-sm text-green-600 font-medium">View All</button>
                  </div>
                  {jobs.slice(0, 3).map(job => <JobCard key={job.id} job={job} />)}
                </div>
                <div>
                   <div className="bg-black text-white rounded-xl p-6 mb-6">
                     <h3 className="font-bold text-lg mb-2">Mission LiFE</h3>
                     <p className="text-gray-400 text-sm mb-4">Complete daily actions to boost your profile for government roles.</p>
                     <button onClick={() => setActiveTab('life')} className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700">View Actions</button>
                   </div>
                   <div className="bg-white rounded-xl border border-gray-200 p-6">
                     <h3 className="font-bold text-lg mb-4">Next Goal</h3>
                     <div className="flex items-center gap-3 mb-2">
                       <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center text-yellow-600">
                         <Trophy size={20} />
                       </div>
                       <div>
                         <p className="font-medium text-sm">Climate Champion</p>
                         <p className="text-xs text-gray-500">Reach 300 pts</p>
                       </div>
                     </div>
                     <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                       <div className="bg-yellow-500 h-full rounded-full" style={{ width: `${Math.min(100, (userData?.life_points / 300) * 100)}%` }}></div>
                     </div>
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'jobs' && (
            <div>
              <div className="mb-6 flex gap-4 overflow-x-auto pb-2">
                {['All', 'Renewable Energy', 'Smart Cities', 'Climate Tech'].map(filter => (
                  <button key={filter} className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium hover:border-black transition-colors whitespace-nowrap">
                    {filter}
                  </button>
                ))}
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {jobs.map(job => <JobCard key={job.id} job={job} />)}
              </div>
            </div>
          )}

          {activeTab === 'life' && (
            <div>
              {Object.entries(lifeActions).map(([category, actions]) => (
                <div key={category} className="mb-8">
                  <h3 className="text-lg font-bold capitalize mb-4 flex items-center gap-2">
                    <span className="w-2 h-6 bg-green-600 rounded-full"></span> 
                    {category} Actions
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {actions.map(action => (
                      <div key={action.id} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex justify-between mb-4">
                          <span className={`text-xs px-2 py-1 rounded bg-gray-100 text-gray-600`}>{action.category}</span>
                          <span className="text-green-600 font-bold">+{action.points} Pts</span>
                        </div>
                        <h4 className="font-bold mb-2">{action.action}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
                          <Leaf size={14} /> Saves {action.carbon}t CO2
                        </div>
                        <button 
                          onClick={() => handleLogAction(action, category)}
                          className="w-full py-2 border border-black rounded-lg text-sm font-medium hover:bg-black hover:text-white transition-colors"
                        >
                          Mark Done
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {activeTab === 'learn' && (
             <div className="grid md:grid-cols-2 gap-6">
                {courses.map(course => (
                   <div key={course.id} className="bg-white p-6 rounded-xl border border-gray-200">
                      <div className="flex justify-between items-start mb-4">
                         <div>
                            <h3 className="font-bold text-lg">{course.title}</h3>
                            <p className="text-sm text-gray-500">{course.provider} • {course.duration}</p>
                         </div>
                         <div className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">
                            Level: {course.level}
                         </div>
                      </div>
                      <div className="mb-4">
                         <p className="text-xs font-bold text-gray-400 mb-2">SKILLS</p>
                         <div className="flex flex-wrap gap-2">
                            {course.skills_taught.map(s => <span key={s} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">{s}</span>)}
                         </div>
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-green-600 text-sm font-bold">Earn {course.life_points_reward} LiFE Pts</span>
                        <a href="#" className="flex items-center gap-1 text-sm font-bold underline decoration-2 underline-offset-4 hover:text-gray-600"> Enroll <ChevronRight size={16}/> </a>
                      </div>
                   </div>
                ))}
             </div>
          )}

          {activeTab === 'profile' && userData && (
             <div className="bg-white rounded-xl border border-gray-200 overflow-hidden max-w-2xl mx-auto">
                <div className="bg-black text-white p-8 text-center">
                   <div className="w-20 h-20 bg-white text-black rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                      {userData.name[0]}
                   </div>
                   <h2 className="text-2xl font-bold">{userData.name}</h2>
                   <p className="opacity-70">{userData.email}</p>
                   <div className="mt-6 flex justify-center gap-8">
                      <div className="text-center">
                         <p className="text-2xl font-bold">{userData.life_points}</p>
                         <p className="text-xs opacity-60">LiFE Points</p>
                      </div>
                      <div className="text-center">
                         <p className="text-2xl font-bold">{userData.badge_level}</p>
                         <p className="text-xs opacity-60">Badge</p>
                      </div>
                   </div>
                </div>
                
                {/* Resume Parser Section */}
                <div className="p-8 border-b border-gray-100 bg-gray-50">
                  <h3 className="font-bold mb-4 flex items-center gap-2"><Briefcase size={18}/> Skill Intelligence (Resume Parser)</h3>
                  <p className="text-sm text-gray-500 mb-4">Paste your resume text below to extract skills automatically.</p>
                  <textarea 
                    className="w-full p-3 border border-gray-300 rounded-lg mb-4 text-sm h-32 focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Example: I am a Software Engineer experienced in Python, React, and Solar Energy systems..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                  />
                  <button 
                    onClick={handleParseResume} 
                    disabled={parsingResume || !resumeText}
                    className="bg-black text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {parsingResume ? 'Analyzing...' : 'Analyze Resume'} <Zap size={16}/>
                  </button>
                </div>

                <div className="p-8">
                   <h3 className="font-bold mb-4">Your Skills</h3>
                   <div className="flex flex-wrap gap-2 mb-8">
                      {userData.skills.length > 0 ? userData.skills.map(s => (
                         <span key={s} className="bg-gray-100 px-3 py-1 rounded-full text-sm">{s}</span>
                      )) : <p className="text-gray-500 text-sm">No skills added yet.</p>}
                   </div>
                   
                   <h3 className="font-bold mb-4">Recent Actions</h3>
                   <div className="space-y-4">
                      {userData.life_actions.length > 0 ? userData.life_actions.slice(0, 5).map((action, i) => (
                         <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                            <div>
                               <p className="font-medium text-sm">{action.action_name}</p>
                               <p className="text-xs text-gray-400">{new Date(action.timestamp).toLocaleDateString()}</p>
                            </div>
                            <span className="font-bold text-green-600">+{action.points}</span>
                         </div>
                      )) : <p className="text-gray-500 text-sm">No actions recorded yet.</p>}
                   </div>
                </div>
             </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
