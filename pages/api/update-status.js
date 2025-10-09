import { getAllParticipants } from '../../lib/leaderboardDB';

// Simple in-memory status tracking
let updateStatus = {
  isRunning: false,
  lastUpdate: null,
  totalParticipants: 0,
  completed: 0,
  errors: 0,
  startTime: null
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const participants = await getAllParticipants();
    
    res.status(200).json({
      success: true,
      status: updateStatus,
      participantCount: participants.length,
      lastUpdated: participants.length > 0 ? participants[0].updatedAt : null,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting update status:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get status',
      message: error.message 
    });
  }
}

// Export status object so other files can update it
export { updateStatus };
