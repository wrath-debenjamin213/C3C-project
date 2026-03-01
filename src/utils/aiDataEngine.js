export const generateAiRoadmap = async (formData) => {
    try {
        const response = await fetch('http://localhost:5000/api/generate-roadmap', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ formData })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API Error: ${response.status} - ${errorData.details || errorData.error}`);
        }

        const data = await response.json();
        const generatedRoadmap = data.roadmap;

        // Calculate metadata dynamically based on the AI's output
        const allTasks = generatedRoadmap.phases.flatMap(p => p.tasks);
        const totalEstimatedHours = allTasks.reduce((acc, task) => acc + (task.estimatedHours || 0), 0);

        const { idea, timeline, category, budget, teamSize } = formData;

        return {
            id: Date.now().toString(),
            ideaName: idea,
            category: category,
            totalWeeks: parseInt(timeline),
            teamSize: parseInt(teamSize) || 1,
            budget: budget,
            totalEstimatedHours: totalEstimatedHours,
            milestones: generatedRoadmap.phases.map(phase => ({
                title: phase.title,
                tasks: phase.tasks,
                progress: 0
            }))
        };
    } catch (error) {
        console.error("AI Generation Failed:", error);
        throw error;
    }
};
