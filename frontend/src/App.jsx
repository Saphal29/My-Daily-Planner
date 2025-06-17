import React, { useState, useEffect } from "react";
import { supabase } from "../../backend/supabase.js";
import "./App.css";

function App() {
    const [todos, setTodos] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("Medium");
    const [editingId, setEditingId] = useState(null);
    const [editFields, setEditFields] = useState({});

    useEffect(() => {
        fetchTodos();
    }, []);

    const fetchTodos = async () => {
        const { data, error } = await supabase
            .from("todos")
            .select("*")
            .order("created_at", { ascending: false });

        if (!error) setTodos(data);
    };

    const addTodo = async () => {
        if (!title.trim()) return;

        const { error } = await supabase.from("todos").insert([
            {
                title,
                description,
                priority,
                is_completed: false,
            },
        ]);

        if (!error) {
            setTitle("");
            setDescription("");
            setPriority("Medium");
            fetchTodos();
        }
    };

    const toggleComplete = async (id, isCompleted) => {
        const { error } = await supabase
            .from("todos")
            .update({ is_completed: !isCompleted, updated_at: new Date() })
            .eq("id", id);

        if (!error) fetchTodos();
    };

    const deleteTodo = async (id) => {
        const { error } = await supabase.from("todos").delete().eq("id", id);
        if (!error) fetchTodos();
    };

    const startEditing = (todo) => {
        setEditingId(todo.id);
        setEditFields({
            title: todo.title,
            description: todo.description || "",
        });
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditFields({});
    };

    const saveEdit = async (id) => {
        const { title, description } = editFields;

        if (!title.trim()) return;

        const { error } = await supabase
            .from("todos")
            .update({ title, description, updated_at: new Date() })
            .eq("id", id);

        if (!error) {
            setEditingId(null);
            setEditFields({});
            fetchTodos();
        }
    };

    return (
        <div className="app">
            <h1>📝My Daily Planner</h1>

            <div className="input-group">
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                <textarea
                    placeholder="Description (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                >
                    <option value="High">🔥 High</option>
                    <option value="Medium">⚖️ Medium</option>
                    <option value="Low">🌱 Low</option>
                </select>

                <button onClick={addTodo}>Add Todo</button>
            </div>

            <h2 className="todo-header">📌 Things to Complete:</h2>

            <ul className="todo-list">
                {todos.map((todo) => (
                    <li key={todo.id} className={todo.is_completed ? "completed" : ""}>
                        {editingId === todo.id ? (
                            <div className="edit-mode">
                                <input
                                    type="text"
                                    value={editFields.title}
                                    onChange={(e) =>
                                        setEditFields({ ...editFields, title: e.target.value })
                                    }
                                />
                                <textarea
                                    value={editFields.description}
                                    onChange={(e) =>
                                        setEditFields({
                                            ...editFields,
                                            description: e.target.value,
                                        })
                                    }
                                />
                                <div className="edit-buttons">
                                    <button onClick={() => saveEdit(todo.id)}>💾 Save</button>
                                    <button onClick={cancelEditing}>❌ Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <div className="todo-display">
                                <input
                                    type="checkbox"
                                    checked={todo.is_completed}
                                    onChange={() => toggleComplete(todo.id, todo.is_completed)}
                                />
                                <div className="todo-text" onClick={() => startEditing(todo)}>
                                    <h3>
                                        {todo.title}
                                        <span className={`priority ${todo.priority}`}>
                      {todo.priority}
                    </span>
                                    </h3>
                                    {todo.description && <p>{todo.description}</p>}
                                </div>

                                <div className="todo-actions">
                                    <button onClick={() => startEditing(todo)}>✏️</button>
                                    <button onClick={() => deleteTodo(todo.id)}>❌</button>
                                </div>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;
