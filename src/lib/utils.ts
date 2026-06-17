export function getInitials(name: string): string {
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export function getAvatarColor(name: string): { bg: string; text: string } {
  const sum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colors = [
    { bg: 'bg-indigo-500/15', text: 'text-indigo-300' },
    { bg: 'bg-violet-500/15', text: 'text-violet-300' },
    { bg: 'bg-emerald-500/15', text: 'text-emerald-300' },
    { bg: 'bg-amber-500/15', text: 'text-amber-300' },
    { bg: 'bg-rose-500/15', text: 'text-rose-300' },
    { bg: 'bg-cyan-500/15', text: 'text-cyan-300' },
    { bg: 'bg-fuchsia-500/15', text: 'text-fuchsia-300' },
    { bg: 'bg-teal-500/15', text: 'text-teal-300' },
  ];
  return colors[sum % colors.length];
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('tr-TR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

export function formatDateTime(ts: number): string {
  return new Date(ts).toLocaleDateString('tr-TR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function getMediaUrl(url: string): string {
  if (!url || url.startsWith('data:')) return url;
  const isHttps = window.location.protocol === 'https:';
  const vdsPrefix = 'http://212.180.120.242:3001/media/';
  if (isHttps && url.startsWith(vdsPrefix)) {
    const filename = url.slice(vdsPrefix.length);
    return `/api/media?file=${encodeURIComponent(filename)}`;
  }
  return url;
}
