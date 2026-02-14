import React from 'react';
import { Shield, Lock, FileText, Globe, AlertTriangle, Check } from 'lucide-react';

export const SystemSecurity: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Security Settings</h1>
          <p className="text-sm text-gray-400 mt-1">Platform access control, authentication policies, and auditing.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Authentication Policy */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-200 mb-6 flex items-center">
                  <Lock className="w-5 h-5 mr-2 text-blue-400" />
                  Authentication
              </h3>
              <div className="space-y-6">
                  <div className="flex items-center justify-between">
                      <div>
                          <p className="text-sm font-medium text-gray-300">Enforce MFA</p>
                          <p className="text-xs text-gray-500">Require 2FA for all admin accounts</p>
                      </div>
                      <div className="w-11 h-6 bg-gray-600 rounded-full relative cursor-pointer">
                          <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm"></div>
                      </div>
                  </div>
                  <div className="flex items-center justify-between">
                      <div>
                          <p className="text-sm font-medium text-gray-300">LDAP / SSO Integration</p>
                          <p className="text-xs text-gray-500">Sync users with Active Directory</p>
                      </div>
                      <div className="w-11 h-6 bg-green-600 rounded-full relative cursor-pointer">
                          <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm"></div>
                      </div>
                  </div>
                  <hr className="border-gray-700" />
                  <div className="space-y-3">
                      <p className="text-sm font-medium text-gray-300">Password Policy</p>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="text-xs text-gray-500 block mb-1">Min Length</label>
                              <input type="number" defaultValue={12} className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1.5 text-sm text-gray-200" />
                          </div>
                          <div>
                              <label className="text-xs text-gray-500 block mb-1">Expiration (Days)</label>
                              <input type="number" defaultValue={90} className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1.5 text-sm text-gray-200" />
                          </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span className="flex items-center"><Check className="w-3 h-3 mr-1 text-green-500"/> Require Special Char</span>
                          <span className="flex items-center"><Check className="w-3 h-3 mr-1 text-green-500"/> Require Number</span>
                      </div>
                  </div>
              </div>
          </div>

          {/* Network Access */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-200 mb-6 flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-purple-400" />
                  Network Access
              </h3>
              <div className="space-y-4">
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
                      <div className="text-xs text-yellow-200/80">
                          <p className="font-bold mb-1">Public Access Warning</p>
                          <p>The platform is currently accessible from public IPs. It is recommended to restrict admin access to VPN IPs only.</p>
                      </div>
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Admin IP Whitelist (CIDR)</label>
                      <textarea 
                          className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm font-mono text-gray-300 h-32 focus:border-blue-500 outline-none"
                          defaultValue={`192.168.1.0/24\n10.0.0.0/8\n203.0.113.5`}
                      ></textarea>
                      <p className="text-xs text-gray-500 mt-2">Enter one IP range per line. Leave empty to allow all.</p>
                  </div>
              </div>
          </div>

          {/* Audit Logs */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-200 mb-6 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-green-400" />
                  Audit & Compliance
              </h3>
              <div className="flex items-center gap-8">
                  <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded border border-gray-700">
                          <div>
                              <p className="text-sm font-medium text-gray-200">DDL Auditing</p>
                              <p className="text-xs text-gray-500">Log all CREATE, DROP, ALTER operations</p>
                          </div>
                          <div className="w-11 h-6 bg-green-600 rounded-full relative cursor-pointer">
                              <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm"></div>
                          </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded border border-gray-700">
                          <div>
                              <p className="text-sm font-medium text-gray-200">DML Auditing</p>
                              <p className="text-xs text-gray-500">Log all INSERT, UPDATE (High Volume)</p>
                          </div>
                          <div className="w-11 h-6 bg-gray-600 rounded-full relative cursor-pointer">
                              <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm"></div>
                          </div>
                      </div>
                  </div>
                  <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded border border-gray-700">
                          <div>
                              <p className="text-sm font-medium text-gray-200">Query Auditing</p>
                              <p className="text-xs text-gray-500">Log SELECT queries > 1s duration</p>
                          </div>
                          <div className="w-11 h-6 bg-green-600 rounded-full relative cursor-pointer">
                              <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm"></div>
                          </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded border border-gray-700">
                          <div>
                              <p className="text-sm font-medium text-gray-200">User Login History</p>
                              <p className="text-xs text-gray-500">Log all successful and failed logins</p>
                          </div>
                          <div className="w-11 h-6 bg-green-600 rounded-full relative cursor-pointer">
                              <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm"></div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};
