
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Users, MessageSquare, Github, Slack, Twitter, ExternalLink, Calendar, Star, MessageCircle } from 'lucide-react';
import { Page } from '../types';

export const HelpCommunity: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 shrink-0">
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => navigate(`/${Page.HELP_CENTER}`)}
                    className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold text-gray-100 flex items-center">
                    <Users className="w-6 h-6 mr-3 text-green-400" />
                    Community Hub
                </h1>
            </div>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-900/20">
                Join our Discord
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-y-auto">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* Hero Banner */}
                <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/30 rounded-xl p-8 relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold text-white mb-2">TDengine Developer Conference 2024</h2>
                        <p className="text-gray-300 mb-6 max-w-lg">Join us globally to explore the future of Time-Series Databases. Call for papers is now open!</p>
                        <div className="flex gap-4">
                            <button className="px-5 py-2 bg-white text-blue-900 rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors">
                                Register Now
                            </button>
                            <button className="px-5 py-2 bg-blue-600/30 border border-blue-400/50 text-blue-100 rounded-lg font-bold text-sm hover:bg-blue-600/40 transition-colors">
                                View Agenda
                            </button>
                        </div>
                    </div>
                    <div className="absolute right-0 top-0 h-full w-1/3 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
                    <Calendar className="absolute -right-6 -bottom-6 w-48 h-48 text-white opacity-5" />
                </div>

                {/* Resource Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-gray-500 transition-colors cursor-pointer group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-gray-700 rounded-full group-hover:bg-black group-hover:text-white transition-colors">
                                <Github className="w-6 h-6" />
                            </div>
                            <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-white" />
                        </div>
                        <h3 className="font-bold text-gray-100 mb-1">GitHub</h3>
                        <p className="text-sm text-gray-400">Report bugs, request features, and contribute code.</p>
                        <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> 22.5k Stars
                        </div>
                    </div>

                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-blue-500/50 transition-colors cursor-pointer group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-900/20 text-blue-400 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <MessageSquare className="w-6 h-6" />
                            </div>
                            <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-white" />
                        </div>
                        <h3 className="font-bold text-gray-100 mb-1">Discord</h3>
                        <p className="text-sm text-gray-400">Chat with developers and get real-time help.</p>
                        <div className="mt-4 flex items-center gap-2 text-xs text-green-400">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span> 450 Online
                        </div>
                    </div>

                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-orange-500/50 transition-colors cursor-pointer group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-orange-900/20 text-orange-400 rounded-full group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                <MessageCircle className="w-6 h-6" />
                            </div>
                            <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-white" />
                        </div>
                        <h3 className="font-bold text-gray-100 mb-1">Stack Overflow</h3>
                        <p className="text-sm text-gray-400">Ask technical questions with the [tdengine] tag.</p>
                        <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                            1.2k Questions
                        </div>
                    </div>
                </div>

                {/* Latest Blog/News */}
                <div>
                    <h3 className="text-lg font-bold text-gray-200 mb-4">Latest from Engineering</h3>
                    <div className="space-y-3">
                        {[
                            { title: 'Optimizing Storage: How we achieved 10x compression', date: 'Oct 24, 2023', author: 'Jeff Tao' },
                            { title: 'Native Grafana Plugin v3.0 Released', date: 'Oct 20, 2023', author: 'Team' },
                            { title: 'Understanding the new Stream Processing Engine', date: 'Oct 15, 2023', author: 'Developer Relations' },
                        ].map((post, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-750 cursor-pointer">
                                <div>
                                    <h4 className="font-medium text-gray-200 hover:text-blue-400 transition-colors">{post.title}</h4>
                                    <p className="text-xs text-gray-500 mt-1">By {post.author} • {post.date}</p>
                                </div>
                                <ChevronLeft className="w-4 h-4 text-gray-600 rotate-180" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sidebar Feed */}
            <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
                    <h3 className="font-bold text-gray-200 mb-4 flex items-center">
                        <Slack className="w-4 h-4 mr-2 text-purple-400" /> Recent Discussions
                    </h3>
                    <div className="space-y-4">
                        {[
                            { user: 'devtools_guy', msg: 'Has anyone tried the new Python connector with Pandas?', time: '2m ago' },
                            { user: 'iot_master', msg: 'Solved the wal_fsync issue, thanks @admin!', time: '15m ago' },
                            { user: 'newbie_dev', msg: 'Getting error code 0x2001 when creating stream.', time: '1h ago' },
                        ].map((chat, i) => (
                            <div key={i} className="flex gap-3 items-start border-b border-gray-700/50 last:border-0 pb-3 last:pb-0">
                                <div className="w-8 h-8 rounded bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300">
                                    {chat.user.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="flex justify-between items-baseline w-full">
                                        <span className="text-xs font-bold text-gray-300">{chat.user}</span>
                                        <span className="text-[10px] text-gray-500">{chat.time}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{chat.msg}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-4 text-xs text-center text-blue-400 hover:text-blue-300">
                        View all discussions
                    </button>
                </div>

                <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
                    <h3 className="font-bold text-gray-200 mb-4 flex items-center">
                        <Twitter className="w-4 h-4 mr-2 text-blue-400" /> Social Feed
                    </h3>
                    <div className="p-3 bg-gray-900/50 rounded border border-gray-700/50 text-sm text-gray-400 italic">
                        "Just deployed a 100-node TDengine cluster for our EV fleet management. The compression ratio is insane! 🚀 #IoT #BigData"
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
