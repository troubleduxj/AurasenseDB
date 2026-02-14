
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { User, Wrench, Palette, Bell, Monitor, Save } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'account', label: 'Account', icon: Wrench },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'display', label: 'Display', icon: Monitor },
];

export const SettingsPage: React.FC = () => {
  const { tab } = useParams<{ tab: string }>();
  const activeTab = tab || 'profile';
  const navigate = useNavigate();

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileForm />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 border border-dashed border-gray-700 rounded-lg">
            <p className="text-sm">The {activeTab} settings panel is under construction.</p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 md:px-8">
      <div className="space-y-1 mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-gray-100">Settings</h2>
        <p className="text-sm text-gray-400">Manage your account settings and set e-mail preferences.</p>
      </div>
      
      <div className="h-px bg-gray-700 mb-8" />

      <div className="flex flex-col lg:flex-row lg:space-x-12 space-y-8 lg:space-y-0">
        <aside className="lg:w-1/5 shrink-0">
          <nav className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-1 overflow-x-auto pb-2 lg:pb-0">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <Link
                  key={item.id}
                  to={`/settings/${item.id}`}
                  className={`
                    flex items-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-gray-800 text-white shadow-sm' 
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                    }
                  `}
                >
                  {/* Icon is optional in the screenshot, but keeping it for consistency if desired. 
                      Screenshot shows text-only sidebar mostly. We will hide icons on desktop to match screenshot closely 
                      but keep them for mobile or if needed. For strict screenshot match, we can hide them. 
                      Let's keep them hidden for exact visual match. */}
                  {/* <item.icon className="w-4 h-4 mr-2" /> */}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex-1 lg:max-w-2xl">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

const ProfileForm: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      <div>
        <h3 className="text-lg font-medium text-gray-100">Profile</h3>
        <p className="text-sm text-gray-400">This is how others will see you on the site.</p>
      </div>
      
      <div className="h-px bg-gray-700" />

      <div className="space-y-8">
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none text-gray-200 peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Username
          </label>
          <input 
            type="text" 
            defaultValue="shadcn"
            className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
          />
          <p className="text-[13px] text-gray-500">
            This is your public display name. It can be your real name or a pseudonym. You can only change this once every 30 days.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none text-gray-200 peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Email
          </label>
          <div className="relative">
            <select 
              className="flex h-10 w-full items-center justify-between rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
              defaultValue=""
            >
                <option value="" disabled>Select a verified email to display</option>
                <option value="admin@tdengine.local">admin@tdengine.local</option>
                <option value="dev@example.com">dev@example.com</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
               <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
          <p className="text-[13px] text-gray-500">
            You can manage verified email addresses in your email settings.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none text-gray-200 peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Bio
          </label>
          <textarea 
            className="flex min-h-[120px] w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            defaultValue="I own a computer."
          />
          <p className="text-[13px] text-gray-500">
            You can <strong>@mention</strong> other users and organizations to link to them.
          </p>
        </div>

        <div className="flex justify-start pt-4">
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-blue-600 text-white hover:bg-blue-700 h-10 py-2 px-4 shadow-sm">
                <Save className="w-4 h-4 mr-2" />
                Update profile
            </button>
        </div>
      </div>
    </div>
  );
};
