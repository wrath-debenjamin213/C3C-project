import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, Clock } from 'lucide-react';

const KanbanBoard = ({ roadmap, onUpdate }) => {
    // Extract all tasks and map them to board columns
    const [boardData, setBoardData] = useState({ todo: [], inProgress: [], done: [] });

    useEffect(() => {
        // Flatten tasks and categorize
        const todo = [];
        const inProgress = [];
        const done = [];

        roadmap.milestones.forEach(m => {
            m.tasks.forEach(t => {
                const enhancedTask = { ...t, milestoneId: m.id, milestoneTitle: m.title };
                if (t.completed || t.status === 'done') {
                    done.push(enhancedTask);
                } else if (t.status === 'in-progress') {
                    inProgress.push(enhancedTask);
                } else {
                    todo.push(enhancedTask);
                }
            });
        });

        setBoardData({ todo, inProgress, done });
    }, [roadmap]);

    // Drag and drop handlers
    const onDragStart = (e, taskId, milestoneId, sourceCol) => {
        e.dataTransfer.setData('taskId', taskId);
        e.dataTransfer.setData('milestoneId', milestoneId);
        e.dataTransfer.setData('sourceCol', sourceCol);
    }

    const onDragOver = (e) => { e.preventDefault(); }

    const onDrop = (e, destCol) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('taskId');
        const milestoneId = e.dataTransfer.getData('milestoneId');
        const sourceCol = e.dataTransfer.getData('sourceCol');

        if (!taskId || sourceCol === destCol) return;

        // Update the roadmap state
        const newMilestones = roadmap.milestones.map(m => {
            if (m.id === milestoneId) {
                const newTasks = m.tasks.map(t => {
                    if (t.id === taskId) {
                        // Update task status
                        const isCompleted = destCol === 'done';
                        let newStatus = 'todo';
                        if (destCol === 'inProgress') newStatus = 'in-progress';
                        if (destCol === 'done') newStatus = 'done';
                        return { ...t, completed: isCompleted, status: newStatus };
                    }
                    return t;
                });

                // Recalculate milestone progress
                const completedCount = newTasks.filter(t => t.completed).length;
                const progress = newTasks.length === 0 ? 0 : Math.round((completedCount / newTasks.length) * 100);
                let newStatusM = m.status;
                if (progress === 100) newStatusM = 'completed';
                else if (progress > 0 && progress < 100) newStatusM = 'active';

                return { ...m, tasks: newTasks, progress, status: newStatusM };
            }
            return m;
        });

        if (onUpdate) onUpdate({ ...roadmap, milestones: newMilestones });
    }

    const Column = ({ title, id, tasks, color }) => (
        <div
            className="kanban-column"
            style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--panel-border)', display: 'flex', flexDirection: 'column', minHeight: '400px' }}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, id)}
        >
            <div style={{ padding: '1rem', borderBottom: `2px solid ${color}`, fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                <span>{title}</span>
                <span style={{ background: 'rgba(255,255,255,0.1)', padding: '0.1rem 0.5rem', borderRadius: '12px', fontSize: '0.8rem' }}>{tasks.length}</span>
            </div>
            <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {tasks.map(task => (
                    <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => onDragStart(e, task.id, task.milestoneId, id)}
                        style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'grab', display: 'flex', flexDirection: 'column', gap: '0.5rem', transition: 'transform 0.2s', ':focus': { outline: 'none' } }}
                        onDragEnd={(e) => e.target.style.opacity = '1'}
                        onDrag={(e) => e.target.style.opacity = '0.5'}
                    >
                        <div style={{ fontSize: '0.95rem', fontWeight: '500', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                            {id === 'done' ? <CheckCircle size={16} color="var(--success-color)" style={{ marginTop: '0.1rem', flexShrink: 0 }} /> : <Circle size={16} color="var(--text-secondary)" style={{ marginTop: '0.1rem', flexShrink: 0 }} />}
                            <span style={{ textDecoration: id === 'done' ? 'line-through' : 'none', color: id === 'done' ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{task.title}</span>
                        </div>
                        <div className="flex items-center justify-between" style={{ marginTop: '0.5rem' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--accent-purple)', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                                {task.milestoneTitle}
                            </span>
                            <span className="flex items-center gap-1" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                <Clock size={12} /> {task.estimatedHours}h
                            </span>
                        </div>
                    </div>
                ))}
                {tasks.length === 0 && (
                    <div style={{ color: 'var(--text-secondary)', textAlign: 'center', margin: 'auto', fontSize: '0.9rem', fontStyle: 'italic', padding: '2rem 0' }}>
                        Drop tasks here
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="fade-in flex gap-4" style={{ alignItems: 'flex-start', overflowX: 'auto', paddingBottom: '1rem' }}>
            <Column title="To Do" id="todo" tasks={boardData.todo} color="var(--text-secondary)" />
            <Column title="In Progress" id="inProgress" tasks={boardData.inProgress} color="var(--accent-blue)" />
            <Column title="Done" id="done" tasks={boardData.done} color="var(--success-color)" />
        </div>
    );
};

export default KanbanBoard;
