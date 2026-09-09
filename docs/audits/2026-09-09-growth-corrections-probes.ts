import {captureMetrics} from '../../lib/capture-metrics';
import {fixtureCall,fixtureGame} from '../../lib/test-fixtures';
import {inferCoverageState,decideNovelty} from '../../lib/social-select';
const event=fixtureGame('fixture-2026');
const call=fixtureCall({id:'unknown-publication',claim:'Away wins.',punditId:'fixture',kind:'hard',eventSlug:event.slug,side:'yes',firstPublishedAt:undefined});
console.log('Missing publication',captureMetrics({calls:[call],events:[event],targets:[{id:'target',state:'approved',eventSlug:event.slug}],interval:{start:'2026-09-09T00:00:00Z',end:'2026-09-10T00:00:00Z'},sourceHours:2}).picksPerSourceHour);
const state=inferCoverageState('Nick Wright picked Seattle. Final: Seattle 27, New England 17.','take');
console.log('Graded receipt classification',state);
console.log('Repeat result decision',decideNovelty('https://pundits.pro/picks/fixture-2026/fixture/','hit',{established:true,records:[{destination:'https://pundits.pro/picks/fixture-2026/fixture/',state,postedAt:'2026-09-09'}]}));
