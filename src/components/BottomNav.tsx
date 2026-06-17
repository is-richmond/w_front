import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/diary', label: 'Diary', icon: '🍽️' },
];

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-800 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-md">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 py-3 text-xs ${
                isActive ? 'text-brand' : 'text-slate-500'
              }`
            }
          >
            <span className="text-lg">{tab.icon}</span>
            {tab.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
