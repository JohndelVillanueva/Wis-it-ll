export function formatNaivePH(dateStr: string | null | undefined): string {
    if (!dateStr) return '—';
  
    const match = String(dateStr).match(
      /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/
    );
  
    if (!match) return String(dateStr);
  
    const [, year, month, day, hour, minute, second = '00'] = match;
  
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
  
    const h = parseInt(hour, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
  
    return `${months[parseInt(month, 10) - 1]} ${day}, ${year}, ${String(
      h12
    ).padStart(2, '0')}:${minute} ${ampm}`;
  }
  
  export function formatNaiveDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '—';
    const match = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return String(dateStr);
  
    const [, year, month, day] = match;
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
  
    return `${months[parseInt(month, 10) - 1]} ${day}, ${year}`;
  }