import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { X } from 'lucide-react';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type TOCItem = {
  id: number;
  menu_title: string;
  parent_id: number | null;
  order: number;
  animation_index: number | null;
  color: string;
};

// Define the props interface
interface TableOfContentDrawerProps {
  drawerState: 'closed' | 'table-of-contents-open';
  handleCloseTableOfContentsDrawer: () => void;
  onSelectSection?: (animationIndex: number) => void;
}

const TableOfContentDrawer: React.FC<TableOfContentDrawerProps> = ({
  drawerState,
  handleCloseTableOfContentsDrawer,
  onSelectSection,
}) => {
  const [items, setItems] = useState<TOCItem[]>([]);
  const [expandedIds, setExpandedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  // Simple color system for headers
  const headerColors = [
    'MediumSeaGreen',
    'MediumTurquoise',
    'MediumSlateBlue',
    'MediumPurple',
    'MediumOrchid'
  ];

  useEffect(() => {
    if (drawerState !== 'table-of-contents-open') return;
    setLoading(true);
    
    const fetchTableOfContents = async () => {
      try {
        const { data, error } = await supabase
          .from('tables_of_content')
          .select('id, menu_title, parent_id, order, animation_index, color')
          .eq('content_name', 'clinamenic_detroit')
          .order('parent_id', { ascending: true })
          .order('order', { ascending: true });
        
        if (error) {
          console.error('Error fetching table of contents:', error);
          return;
        }
        
        setItems(data as TOCItem[] || []);
      } catch (error) {
        console.error('Error in fetchTableOfContents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTableOfContents();
  }, [drawerState]);

  // After fetching the items, identify the item with no parent and an animation_index
  const specialItem = items.find((i) => i.parent_id === null && i.animation_index !== null);

  // Filter out the special item from the topLevel array
  const topLevel = items.filter((i) => i.parent_id === null && i !== specialItem);

  // If a special item exists, place it at the top of the topLevel array
  if (specialItem) {
    topLevel.unshift(specialItem);
  }

  // Build nested structure
  const childrenMap: Record<number, TOCItem[]> = {};
  items.forEach((i) => {
    if (i.parent_id !== null) {
      childrenMap[i.parent_id] = childrenMap[i.parent_id] || [];
      childrenMap[i.parent_id].push(i);
    }
  });

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Ensure the special item is not included in the collapsible headers
  const filteredTopLevel = topLevel.filter((section) => section !== specialItem);

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-start justify-center transition-transform duration-300 ease-in-out transform ${
        drawerState === 'table-of-contents-open' ? 'translate-y-0' : 'translate-y-[100vh]'
      }`}
    >
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black opacity-50 transition-opacity duration-300 ease-in-out ${
          drawerState === 'table-of-contents-open' ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleCloseTableOfContentsDrawer}
      ></div>

      {/* Drawer Content */}
      <div
        className="relative bg-black rounded-t-lg overflow-hidden transform transition-transform duration-300 ease-in-out w-11/12 md:w-auto md:h-4/5 aspect-square md:aspect-square"
        onClick={(e) => e.stopPropagation()} // Prevent click from closing drawer
      >
        

        {/* Drawer Container */}
        <div className="drawer-container w-full h-full relative">
          {/* Table of Contents Content */}
          <div className="p-6 text-white">
            <h2 className="text-2xl font-bold mb-6">Table of Contents</h2>
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {specialItem && (
                  <div className="border-b border-gray-700 pb-4">
                    <button
                      className="flex justify-between w-full text-left font-semibold text-lg hover:text-gray-300 transition-colors p-2 rounded"
                      style={{ backgroundColor: specialItem.color || 'MediumSeaGreen' }}
                      onClick={() => {
                        if (specialItem.animation_index !== null && onSelectSection) {
                          console.log('Selecting animation index:', specialItem.animation_index);
                          onSelectSection(specialItem.animation_index);
                          handleCloseTableOfContentsDrawer();
                        }
                      }}
                    >
                      {specialItem.menu_title}
                    </button>
                  </div>
                )}
                {filteredTopLevel.map((section) => (
                  <div key={section.id} className="border-b border-gray-700 pb-4">
                    <button
                      className="flex justify-between w-full text-left font-semibold text-lg hover:text-gray-300 transition-colors p-2 rounded"
                      style={{ backgroundColor: section.color || 'MediumSeaGreen' }}
                      onClick={() => toggleExpand(section.id)}
                    >
                      {section.menu_title}
                      <span className="text-xl">
                        {expandedIds.includes(section.id) ? '−' : '+'}
                      </span>
                    </button>

                    {expandedIds.includes(section.id) && (
                      <ul className="mt-3 ml-4 space-y-2">
                        {childrenMap[section.id]?.map((sub) => (
                          <li key={sub.id}>
                            <button
                              className="text-base hover:text-gray-300 transition-colors"
                              onClick={() => {
                                if (sub.animation_index !== null && onSelectSection) {
                                  console.log('Selecting animation index:', sub.animation_index);
                                  onSelectSection(sub.animation_index);
                                  handleCloseTableOfContentsDrawer();
                                }
                              }}
                            >
                              {sub.menu_title}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableOfContentDrawer;
