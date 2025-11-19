interface ScenarioInfoSidebarProps {
  scenarioId?: string | null
  theme?: string | null
}

export default function ScenarioInfoSidebar({
  scenarioId,
  theme
}: ScenarioInfoSidebarProps) {
  // Dummy scenario data - in real implementation, this would be fetched based on scenarioId
  const scenarioData = scenarioId ? {
    title: 'Hotel Check-in',
    description: 'Practice checking into a hotel. You will play the role of a tourist checking into a hotel, while the AI acts as the hotel receptionist.',
    teacher_role: 'Hotel Receptionist',
    student_role: 'Tourist',
    theme_title: 'Travel'
  } : null

  return (
    <div className="absolute top-2 left-4 w-80 h-[calc(100vh-1rem)] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col z-20">
      <div className="bg-gradient-to-r from-secondary to-tertiary text-white px-4 py-2 flex-shrink-0">
        <h3 className="text-xl font-semibold">Scenario Information</h3>
      </div>
      <div className="p-4 overflow-y-auto flex-1">
        {!scenarioData ? (
          <div className="text-xs text-gray-500 text-center py-8">
            No scenario selected
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Scenario</h4>
              <p className="text-sm text-gray-700">{scenarioData.title}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Description</h4>
              <p className="text-xs text-gray-600 leading-relaxed">{scenarioData.description}</p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Roles</h4>
              <div className="space-y-2">
                <div className="p-2 bg-blue-50 rounded border border-blue-200">
                  <div className="text-xs font-medium text-gray-600 mb-1">AI Role</div>
                  <div className="text-sm text-gray-900">{scenarioData.teacher_role}</div>
                </div>
                <div className="p-2 bg-green-50 rounded border border-green-200">
                  <div className="text-xs font-medium text-gray-600 mb-1">Your Role</div>
                  <div className="text-sm text-gray-900">{scenarioData.student_role}</div>
                </div>
              </div>
            </div>

            {scenarioData.theme_title && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Theme</h4>
                <p className="text-xs text-gray-600">{scenarioData.theme_title}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

