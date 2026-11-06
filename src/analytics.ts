export type AnalyticsEvent = 'pageview' | 'game_enter';
type Options = {
 enabled: boolean;
 storage: Pick<Storage, 'getItem' | 'setItem'>;
 randomUUID: () => string;
 now?: () => number;
 send: (payload: {visitorId: string; viewId: string; event: AnalyticsEvent}) => Promise<unknown>;
 onError?: (error: unknown) => void;
};
// One instance per document. Effects and repeated game clicks reuse the view ID.
export function createTracker(options: Options) {
 let visitorId = '', viewId = '';
 const sent = new Set<string>();
 return (event: AnalyticsEvent) => {
  if (!options.enabled) return;
  const day = Math.floor(((options.now?.() ?? Date.now()) + 8*3600*1000) / 86400000);
  const key = event === 'game_enter' ? event+day : event;
  if (sent.has(key)) return;
  try {
   if (!visitorId) {
    try { visitorId = options.storage.getItem('meme-analytics-visitor') || ''; } catch {}
    if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(visitorId)) {
     visitorId = options.randomUUID();
     try { options.storage.setItem('meme-analytics-visitor', visitorId); } catch {}
    }
   }
   if (!viewId) viewId = options.randomUUID();
   sent.add(key);
   void options.send({visitorId,viewId,event}).catch(error => options.onError?.(error));
  } catch (error) { options.onError?.(error); }
 };
}
