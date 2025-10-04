import React from 'react';
import { Agent } from '../../types/agents';
import { Language, translations } from '../../lib/translations';

interface AgentPaletteProps {
  agents: Agent[];
  onDragStart: (agent: Agent) => void;
  language: Language;
  className?: string;
}

const AgentPalette: React.FC<AgentPaletteProps> = ({
  agents,
  onDragStart,
  language,
  className = ''
}) => {
  const t = translations[language];

  const getIconComponent = (iconName: string) => {
    // Placeholder per le icone - in futuro si può implementare un sistema di icone dinamico
    const iconMap: { [key: string]: string } = {
      'WandIcon': '🪄',
      'CogIcon': '⚙️',
      'LightBulbIcon': '💡',
      'CodeIcon': '💻',
      'BrainIcon': '🧠',
      'RobotIcon': '🤖',
      'ChartIcon': '📊',
      'BriefcaseIcon': '💼',
      'TargetIcon': '🎯',
      'TrendingUpIcon': '📈',
      'UsersIcon': '👥',
      'BuildingIcon': '🏢',
      'PaletteIcon': '🎨',
      'PaintBrushIcon': '🖌️',
      'CameraIcon': '📷',
      'MusicIcon': '🎵',
      'FilmIcon': '🎬',
      'GameIcon': '🎮',
      'WrenchIcon': '🔧',
      'HammerIcon': '🔨',
      'ScrewdriverIcon': '🪛',
      'ToolboxIcon': '🧰',
      'GearIcon': '⚙️',
      'KeyIcon': '🔑'
    };
    
    return iconMap[iconName] || '🤖';
  };

  const systemAgents = agents.filter(agent => agent.isSystem);
  const customAgents = agents.filter(agent => !agent.isSystem);

  return (
    <div className={`w-64 bg-white border-r border-gray-200 flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          {t.agentPalette || 'Agent Palette'}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          {t.dragAgentsToCanvas || 'Drag agents to the canvas to build your workflow'}
        </p>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <input
          type="text"
          placeholder={t.searchAgents || 'Search agents...'}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Agents List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* System Agents */}
        {systemAgents.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              {t.systemAgents || 'System Agents'}
            </h4>
            <div className="space-y-2">
              {systemAgents.map(agent => (
                <div
                  key={agent.id}
                  draggable
                  onDragStart={() => onDragStart(agent)}
                  className="p-3 border border-gray-200 rounded-lg cursor-move hover:border-blue-300 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {getIconComponent(agent.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {agent.name}
                      </div>
                      <div className="text-xs text-gray-500 line-clamp-2">
                        {agent.description}
                      </div>
                      <div className="flex items-center mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {t.system || 'System'}
                        </span>
                        {agent.isActive && (
                          <div className="ml-2 w-2 h-2 bg-green-400 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom Agents */}
        {customAgents.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              {t.customAgents || 'Custom Agents'}
            </h4>
            <div className="space-y-2">
              {customAgents.map(agent => (
                <div
                  key={agent.id}
                  draggable
                  onDragStart={() => onDragStart(agent)}
                  className="p-3 border border-gray-200 rounded-lg cursor-move hover:border-blue-300 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {getIconComponent(agent.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {agent.name}
                      </div>
                      <div className="text-xs text-gray-500 line-clamp-2">
                        {agent.description}
                      </div>
                      <div className="flex items-center mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {t.custom || 'Custom'}
                        </span>
                        {agent.isActive && (
                          <div className="ml-2 w-2 h-2 bg-green-400 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {agents.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">
              {t.noAgentsAvailable || 'No agents available'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentPalette;
