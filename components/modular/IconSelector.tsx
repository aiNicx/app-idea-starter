import React, { useState } from 'react';
import { Language, translations } from '../../lib/translations';

interface IconSelectorProps {
  selectedIcon: string;
  onSelect: (icon: string) => void;
  language: Language;
}

const IconSelector: React.FC<IconSelectorProps> = ({
  selectedIcon,
  onSelect,
  language
}) => {
  const t = translations[language];
  const [selectedCategory, setSelectedCategory] = useState('ai');

  const iconCategories = {
    ai: {
      name: 'AI & Tech',
      icons: [
        { id: 'WandIcon', name: 'Wand', component: '🪄' },
        { id: 'CogIcon', name: 'Cog', component: '⚙️' },
        { id: 'LightBulbIcon', name: 'Light Bulb', component: '💡' },
        { id: 'CodeIcon', name: 'Code', component: '💻' },
        { id: 'BrainIcon', name: 'Brain', component: '🧠' },
        { id: 'RobotIcon', name: 'Robot', component: '🤖' }
      ]
    },
    business: {
      name: 'Business',
      icons: [
        { id: 'ChartIcon', name: 'Chart', component: '📊' },
        { id: 'BriefcaseIcon', name: 'Briefcase', component: '💼' },
        { id: 'TargetIcon', name: 'Target', component: '🎯' },
        { id: 'TrendingUpIcon', name: 'Trending Up', component: '📈' },
        { id: 'UsersIcon', name: 'Users', component: '👥' },
        { id: 'BuildingIcon', name: 'Building', component: '🏢' }
      ]
    },
    creative: {
      name: 'Creative',
      icons: [
        { id: 'PaletteIcon', name: 'Palette', component: '🎨' },
        { id: 'PaintBrushIcon', name: 'Paint Brush', component: '🖌️' },
        { id: 'CameraIcon', name: 'Camera', component: '📷' },
        { id: 'MusicIcon', name: 'Music', component: '🎵' },
        { id: 'FilmIcon', name: 'Film', component: '🎬' },
        { id: 'GameIcon', name: 'Game', component: '🎮' }
      ]
    },
    tools: {
      name: 'Tools',
      icons: [
        { id: 'WrenchIcon', name: 'Wrench', component: '🔧' },
        { id: 'HammerIcon', name: 'Hammer', component: '🔨' },
        { id: 'ScrewdriverIcon', name: 'Screwdriver', component: '🪛' },
        { id: 'ToolboxIcon', name: 'Toolbox', component: '🧰' },
        { id: 'GearIcon', name: 'Gear', component: '⚙️' },
        { id: 'KeyIcon', name: 'Key', component: '🔑' }
      ]
    }
  };

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {Object.entries(iconCategories).map(([key, category]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key)}
            className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
              selectedCategory === key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Icon Grid */}
      <div className="grid grid-cols-6 gap-2">
        {iconCategories[selectedCategory as keyof typeof iconCategories].icons.map((icon) => (
          <button
            key={icon.id}
            onClick={() => onSelect(icon.id)}
            className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
              selectedIcon === icon.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            title={icon.name}
          >
            <div className="text-2xl text-center">{icon.component}</div>
          </button>
        ))}
      </div>

      {/* Selected Icon Preview */}
      {selectedIcon && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">
              {iconCategories[selectedCategory as keyof typeof iconCategories].icons.find(
                icon => icon.id === selectedIcon
              )?.component}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">
                {iconCategories[selectedCategory as keyof typeof iconCategories].icons.find(
                  icon => icon.id === selectedIcon
                )?.name}
              </div>
              <div className="text-xs text-gray-500">{selectedIcon}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IconSelector;
