# Grade audit 2026-08-29

Scope: all four mapped hard calls on `unc-vs-tcu-2026`, with the requested Patterson and Finebaum calls called out explicitly. Audit did not edit `data/*.json`.

Evidence reopened:

- [UNC official game center](https://goheels.com/game-center/26876): Final, North Carolina 15, TCU 10.
- [TCU official game center](https://gofrogs.com/game-center/20096): Completed event, TCU loss 10–15.
- [Kalshi event API](https://external-api.kalshi.com/trade-api/v2/events/KXNCAAFGAME-26AUG29UNCTCU?with_nested_markets=true): `KXNCAAFGAME-26AUG29UNCTCU-UNC` finalized `yes`; `KXNCAAFGAME-26AUG29UNCTCU-TCU` finalized `no`; settlement timestamp 2026-08-29T19:38:11.282168Z.

The official final and Kalshi resolution agree. In `data/events.json`, North Carolina is the away team and therefore maps to `yes`; TCU is the home team and maps to `no`.

| call id | punditId | eventSlug | side | proposed status | gradedAt | verdict | note |
|---|---|---|---|---|---|---|---|
| patterson-unc-tcu-20260827 | patterson | unc-vs-tcu-2026 | yes | hit | 2026-08-29 | ok | UNC won; away/yes mapping is correct. |
| mcelroy-unc-tcu-20260829 | mcelroy | unc-vs-tcu-2026 | yes | hit | 2026-08-29 | ok | UNC won; away/yes mapping is correct. |
| finebaum-unc-tcu-20260825 | finebaum | unc-vs-tcu-2026 | no | miss | 2026-08-29 | ok | TCU lost; home/no mapping is correct. |
| compton-unc-tcu-20260829 | compton | unc-vs-tcu-2026 | no | miss | 2026-08-29 | ok | TCU lost; home/no mapping is correct. |

4 ok / 0 fail / ready to promote 4.

## NC State–Virginia grade audit

Scope: every mapped hard call on `ncsu-at-uva-2026`. Audit did not edit `data/*.json`.

Evidence reopened:

- [NC State official box score](https://gopack.com/sports/football/stats/2026/virginia/boxscore/24537): Final, Virginia 34, NC State 8.
- [Virginia official highlights](https://virginiasports.com/news/2026/08/29/highlights-football-vs-nc-state-82926): Virginia 34, NC State 8.
- [Kalshi event API](https://external-api.kalshi.com/trade-api/v2/events/KXNCAAFGAME-26AUG29NCSTUVA?with_nested_markets=true): `KXNCAAFGAME-26AUG29NCSTUVA-UVA` finalized `yes`; `KXNCAAFGAME-26AUG29NCSTUVA-NCST` finalized `no`; settlement timestamp 2026-08-29T22:46:21.19294Z.

The two official school sources and Kalshi resolution agree. In `data/events.json`, NC State is the away team and maps to `yes`; Virginia is the home team and maps to `no`. The proposal grades every mapped call on the event and uses the Eastern calendar date.

| call id | punditId | eventSlug | side | proposed status | gradedAt | verdict | note |
|---|---|---|---|---|---|---|---|
| kanell-ncsu-uva-20260827 | kanell | ncsu-at-uva-2026 | yes | miss | 2026-08-29 | ok | Virginia won; NC State away/yes mapping is correct. |
| patterson-ncsu-uva-20260827 | patterson | ncsu-at-uva-2026 | yes | miss | 2026-08-29 | ok | Virginia won; NC State away/yes mapping is correct. |

2 ok / 0 fail / ready to promote 2.
