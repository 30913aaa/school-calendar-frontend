import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles.css';

function EventForm() {
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start: '',
    end: '',
    location: '',
    type: 'activity',
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = () => {
    axios.get('http://localhost:5000/events')
      .then(response => setEvents(response.data))
      .catch(error => console.error('無法獲取事件:', error));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      // 更新事件
      axios.put(`http://localhost:5000/events/${editingId}`, formData)
        .then(() => {
          alert('事件更新成功！');
          setEditingId(null);
          setFormData({ title: '', description: '', start: '', end: '', location: '', type: 'activity' });
          fetchEvents();
        })
        .catch(error => console.error('更新事件失敗:', error));
    } else {
      // 新增事件
      axios.post('http://localhost:5000/events', formData)
        .then(() => {
          alert('事件新增成功！');
          setFormData({ title: '', description: '', start: '', end: '', location: '', type: 'activity' });
          fetchEvents();
        })
        .catch(error => console.error('新增事件失敗:', error));
    }
  };

  const handleEdit = (event) => {
    setEditingId(event._id);
    setFormData({
      title: event.title,
      description: event.description,
      start: new Date(event.start).toISOString().slice(0, 16),
      end: new Date(event.end).toISOString().slice(0, 16),
      location: event.location,
      type: event.type,
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('確定要刪除此事件？')) {
      axios.delete(`http://localhost:5000/events/${id}`)
        .then(() => {
          alert('事件刪除成功！');
          fetchEvents();
        })
        .catch(error => console.error('刪除事件失敗:', error));
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>管理事件</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <div>
          <label>標題：</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} required />
        </div>
        <div>
          <label>描述：</label>
          <textarea name="description" value={formData.description} onChange={handleChange}></textarea>
        </div>
        <div>
          <label>開始時間：</label>
          <input type="datetime-local" name="start" value={formData.start} onChange={handleChange} required />
        </div>
        <div>
          <label>結束時間：</label>
          <input type="datetime-local" name="end" value={formData.end} onChange={handleChange} required />
        </div>
        <div>
          <label>地點：</label>
          <input type="text" name="location" value={formData.location} onChange={handleChange} />
        </div>
        <div>
          <label>類型：</label>
          <select name="type" value={formData.type} onChange={handleChange}>
            <option value="activity">活動</option>
            <option value="announcement">公告</option>
            <option value="holiday">假期</option>
          </select>
        </div>
        <button type="submit">{editingId ? '更新事件' : '新增事件'}</button>
        {editingId && (
          <button type="button" onClick={() => {
            setEditingId(null);
            setFormData({ title: '', description: '', start: '', end: '', location: '', type: 'activity' });
          }}>
            取消編輯
          </button>
        )}
      </form>

      <h2>事件列表</h2>
      <ul>
        {events.map(event => (
          <li key={event._id}>
            {event.title} - {new Date(event.start).toLocaleString()} 至 {new Date(event.end).toLocaleString()}
            <button onClick={() => handleEdit(event)} style={{ marginLeft: '10px' }}>編輯</button>
            <button onClick={() => handleDelete(event._id)} style={{ marginLeft: '10px' }}>刪除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default EventForm;