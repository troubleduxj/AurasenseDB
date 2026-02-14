import React, { useState } from 'react';
import { Bell, Mail, Webhook, MessageSquare, Save, Plus, Edit2, Trash2 } from 'lucide-react';

export const SystemNotifications: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'channels' | 'templates'>('channels');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Notification Settings</h1>
          <p className="text-sm text-gray-400 mt-1">Configure alerting channels and message templates.</p>
        </div>
        <div className="flex gap-2 bg-gray-800 p-1 rounded-lg border border-gray-700">
            <button 
                onClick={() => setActiveTab('channels')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'channels' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
            >
                Channels
            </button>
            <button 
                onClick={() => setActiveTab('templates')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'templates' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
            >
                Templates
            </button>
        </div>
      </div>

      {activeTab === 'channels' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* SMTP Configuration */}
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-200 flex items-center">
                          <Mail className="w-5 h-5 mr-2 text-blue-400" />
                          SMTP Server
                      </h3>
                      <div className="w-11 h-6 bg-green-600 rounded-full relative cursor-pointer">
                          <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm"></div>
                      </div>
                  </div>
                  <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                          <div className="col-span-2">
                              <label className="block text-xs text-gray-500 mb-1">Host</label>
                              <input type="text" defaultValue="smtp.gmail.com" className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm text-gray-200 outline-none" />
                          </div>
                          <div className="col-span-1">
                              <label className="block text-xs text-gray-500 mb-1">Port</label>
                              <input type="number" defaultValue={587} className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm text-gray-200 outline-none" />
                          </div>
                      </div>
                      <div>
                          <label className="block text-xs text-gray-500 mb-1">Username</label>
                          <input type="text" defaultValue="alerts@tdengine.local" className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm text-gray-200 outline-none" />
                      </div>
                      <div>
                          <label className="block text-xs text-gray-500 mb-1">Password</label>
                          <input type="password" defaultValue="********" className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm text-gray-200 outline-none" />
                      </div>
                      <div>
                          <label className="block text-xs text-gray-500 mb-1">Sender Name</label>
                          <input type="text" defaultValue="TDengine Alerts" className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm text-gray-200 outline-none" />
                      </div>
                      <div className="pt-4 flex justify-end">
                          <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors">
                              Send Test Email
                          </button>
                      </div>
                  </div>
              </div>

              {/* Other Channels */}
              <div className="space-y-6">
                  {/* Slack */}
                  <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                      <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-200 flex items-center">
                              <MessageSquare className="w-5 h-5 mr-2 text-purple-400" />
                              Slack Integration
                          </h3>
                          <div className="w-11 h-6 bg-gray-600 rounded-full relative cursor-pointer">
                              <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm"></div>
                          </div>
                      </div>
                      <p className="text-xs text-gray-500 mb-4">Post alerts to a specific Slack channel via Incoming Webhook or Bot Token.</p>
                      <div>
                          <label className="block text-xs text-gray-500 mb-1">Webhook URL</label>
                          <input type="password" placeholder="https://hooks.slack.com/services/..." className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm text-gray-200 outline-none" disabled />
                      </div>
                  </div>

                  {/* Generic Webhook */}
                  <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                      <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-200 flex items-center">
                              <Webhook className="w-5 h-5 mr-2 text-yellow-400" />
                              Global Webhook
                          </h3>
                          <div className="w-11 h-6 bg-green-600 rounded-full relative cursor-pointer">
                              <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm"></div>
                          </div>
                      </div>
                      <div className="space-y-3">
                          <div>
                              <label className="block text-xs text-gray-500 mb-1">Endpoint URL</label>
                              <input type="text" defaultValue="https://api.opsgenie.com/v1/alerts" className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm text-gray-200 outline-none" />
                          </div>
                          <div>
                              <label className="block text-xs text-gray-500 mb-1">Auth Header</label>
                              <input type="text" defaultValue="Authorization: GenieKey 123-abc" className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm text-gray-200 outline-none" />
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      ) : (
          /* Templates Tab */
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-700 bg-gray-750 text-xs font-medium text-gray-400 uppercase">
                  <div className="col-span-3">Template Name</div>
                  <div className="col-span-2">Type</div>
                  <div className="col-span-5">Subject / Preview</div>
                  <div className="col-span-2 text-right">Actions</div>
              </div>
              {[
                  { name: 'Default Alert', type: 'Email', preview: '[Alert] {{rule_name}} is triggering on {{host}}' },
                  { name: 'Recovery Notice', type: 'Email', preview: '[Resolved] {{rule_name}} back to normal' },
                  { name: 'Slack Compact', type: 'Slack Payload', preview: '{"text": ":warning: *{{rule_name}}*: {{value}}"}' },
              ].map((tpl, i) => (
                  <div key={i} className="grid grid-cols-12 gap-4 p-4 border-b border-gray-700 last:border-0 hover:bg-gray-700/30 items-center">
                      <div className="col-span-3 font-medium text-gray-200">{tpl.name}</div>
                      <div className="col-span-2">
                          <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">{tpl.type}</span>
                      </div>
                      <div className="col-span-5 text-xs font-mono text-gray-400 truncate">{tpl.preview}</div>
                      <div className="col-span-2 flex justify-end gap-2">
                          <button className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded"><Edit2 className="w-4 h-4"/></button>
                          <button className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded"><Trash2 className="w-4 h-4"/></button>
                      </div>
                  </div>
              ))}
              <div className="p-4 bg-gray-800/50">
                  <button className="flex items-center text-sm text-blue-400 hover:text-blue-300">
                      <Plus className="w-4 h-4 mr-2" /> Add Custom Template
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};
