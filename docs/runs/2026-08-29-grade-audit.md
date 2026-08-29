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
