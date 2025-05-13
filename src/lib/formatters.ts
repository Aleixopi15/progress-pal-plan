
/**
 * Format seconds into a human-readable time string (hh:mm:ss)
 */
export function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  // Format parts with leading zeros
  const formattedHours = hours.toString().padStart(2, '0');
  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSeconds = seconds.toString().padStart(2, '0');
  
  // Return formatted time
  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

/**
 * Format minutes into a human-readable time string (hh:mm)
 */
export function formatMinutesToHoursAndMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  if (hours === 0) {
    return `${minutes}min`;
  }
  
  return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
}
