'use client';

import React, { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../../contexts/AuthContext';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getHistoryOfUser } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getHistoryOfUser();
        setHistory(data || []);
      } catch (err) {
        console.error("Error fetching call history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="homeContainer">
      <nav className="homeNav">
        <div className="navBrand">
          <h2>MeetSphere</h2>
        </div>
        <div className="navActions">
          <button className="navBtn secondaryBtn" onClick={() => router.push('/home')}>
            🏠 Home Dashboard
          </button>
        </div>
      </nav>

      <main className="historyMain">
        <div className="historyCard">
          <h2>📜 Meeting History</h2>
          <p className="historySubtitle">Review your previous video calls and rejoin quickly.</p>

          {loading ? (
            <div className="loadingSpinner">Loading call history...</div>
          ) : history.length === 0 ? (
            <div className="emptyHistory">
              <p>No past meetings found.</p>
              <button className="createBtn" onClick={() => router.push('/home')}>
                Start a New Meeting
              </button>
            </div>
          ) : (
            <div className="historyTable">
              {history.map((meeting, index) => (
                <div key={index} className="historyRow">
                  <div className="meetingInfo">
                    <span className="meetingCodeBadge">🔑 {meeting.meetingCode}</span>
                    <span className="meetingDate">
                      {meeting.date ? new Date(meeting.date).toLocaleString() : 'Recent'}
                    </span>
                  </div>
                  <button
                    className="rejoinBtn"
                    onClick={() => router.push(`/${meeting.meetingCode}`)}
                  >
                    Rejoin Call ➡️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
