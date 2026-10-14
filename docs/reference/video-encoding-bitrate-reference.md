# Video Encoding Bitrate Reference: OLV, VOD, and CTV Advertising

Public specifications checked October 14, 2026. Focus: primarily US online video (OLV) and ad-supported video-on-demand (VOD) / connected TV (CTV).

> **Why this is in the repo:** it's the source-of-truth behind the Transcoding feature's
> **Video Bitrate** option list and the per-publisher preset bitrates
> (`src/lib/transcodePresets.ts`). Update the presets/options here when a spec changes.

## How to interpret these specifications

There is no universal industry-standard bitrate. Distinguish between **ready-to-serve encodes** delivered to viewers and **source/mezzanine files** supplied for transcoding. A 4 Mbps playback file and a 25 Mbps submission file can both be correct for the same campaign.

All figures below are **video bitrate**, unless noted. **1 Mbps = 1,000 kbps**. CBR means constant bitrate; VBR means variable bitrate. Publisher requirements and buying routes take precedence over general guidance.

## IAB guidance

IAB’s 2022 guidelines provide a historical baseline. Its 2026 revision raises several bitrate ranges substantially. The newer guidance is available in IAB’s official repository, but the accompanying announcement describes it as a public-comment draft; this reference does not assert that it is a finalized standard. [IAB revision announcement](https://iabtechlab.com/ready-for-primetime-video-ad-guidelines/)

| Resolution / rendition | IAB 2022 target | IAB 2026 revision: H.264 target |
|---|---:|---:|
| 360p / low | 0.5–0.7 Mbps | 1.5–3 Mbps |
| 480p–540p / medium* | 0.7–1.5 Mbps | 2–4 Mbps |
| 720p HD | 1.5–2.5 Mbps | 2–5 Mbps |
| 1080p Full HD | 2.5–3.5 Mbps | 4–10 Mbps |
| 2160p / 4K | No separate target in the cited table | 15–30 Mbps |

*The older medium tier extends through 576p.

Sources: [IAB 2022 guidelines, p. 15](https://iabcanada.com/wp-content/uploads/2023/07/Ad-Format-Guidelines_DV-CTV2022.pdf), [IAB v2.0 revision](https://github.com/InteractiveAdvertisingBureau/Ad-Format-Guidelines-for-Digital-Video-CTV/blob/main/v2.0.md).

The revision associates the lower ends with OLV/web/mobile and the upper ends with CTV. It emphasizes content complexity, frame rate, encoder quality, and publisher requirements over a fixed bits-per-pixel formula. These are rendition guidelines, not universal upload requirements. [IAB v2.0 revision](https://github.com/InteractiveAdvertisingBureau/Ad-Format-Guidelines-for-Digital-Video-CTV/blob/main/v2.0.md)

## Major publishers and streaming destinations

| Publisher / product | Published bitrate | What the number applies to | Source |
|---|---|---|---|
| Amazon DSP — OLV | **4 Mbps minimum; 8 Mbps recommended**. Third-party served: **2 Mbps minimum** | Site-served submission versus third-party serving. Site-served horizontal assets require 1080p; third-party minimum is 360p. | [Amazon OLV specs](https://advertising.amazon.com/resources/ad-specs/dsp/video/online-video-ads) |
| Amazon — Prime Video | **15 Mbps minimum; 50 Mbps recommended** | Streaming-TV creative submission, minimum 1920×1080. | [Amazon streaming-TV specs](https://advertising.amazon.com/en-ca/resources/ad-specs/dsp/video/streaming-tv-prime-video-ads) |
| Amazon DSP — Twitch, Fire TV Channels, third-party apps/exchanges | **8 Mbps minimum** | Streaming-TV creative submission. Amazon recommends submitting at least 15 Mbps to maximize supply coverage. | [Amazon streaming-TV specs](https://advertising.amazon.com/en-ca/resources/ad-specs/dsp/video/streaming-tv-prime-video-ads) |
| Disney+ — dedicated publisher spec | **10–40 Mbps CBR** | VAST and site-served assets; 1080p preferred, 720p accepted. Spec updated March 5, 2026. | [Disney+ specifications](https://files.disneyadvertising.com/MediaKit/Disney-Plus/disneyplus_video.pdf) |
| Disney/Hulu — Video Commercial | General HD: **10–40 Mbps CBR**. Programmatic: **15–60 Mbps CBR preferred**, **20–60 Mbps VBR accepted** | Separate general and programmatic requirements on the same product page. The buying route matters. | [Disney/Hulu specifications](https://products.disneyadvertising.com/video-commercial/) |
| NBCU / Peacock — through CM360 | Upload source: **≥25 Mbps**; required mezzanine: **≥15 Mbps at 1080p** | Google’s documented workflow for generating Peacock-compliant assets. | [CM360 Peacock instructions](https://support.google.com/campaignmanager/answer/12082101?hl=en) |
| Roku Self Serve | **6 Mbps minimum** | Uploaded streaming-ad creative. Specifically Roku’s self-serve product. | [Roku technical requirements](https://help.ads.roku.com/en/articles/7193013-creative-technical-requirements) |

## Ad servers, DSPs, and SSPs

| Platform | Published bitrate(s) | Interpretation | Source |
|---|---|---|---|
| Google Campaign Manager 360 — ad server | Example MP4 transcodes: **360p: 0.4 / 1 / 1.5 Mbps; 540p: 1.25 Mbps; 720p: 2 Mbps; 1080p: 4 Mbps**. Also lists a **20 Mbps** source-resolution rendition. | Generated serving files, not a recommended source-file ceiling. | [CM360 transcode table](https://support.google.com/campaignmanager/answer/3312854?hl=en) |
| Google DV360 — DSP | **≥20 Mbps** | Best-practice source upload recommendation. Upload the highest-spec source available for transcoding. This page excludes YouTube & partners videos. | [DV360 guidelines](https://support.google.com/displayvideo/answer/3129957?hl=en) |
| The Trade Desk — DSP, CTV media files | Mezzanine **15–30 Mbps at 1080p**; high **4–6.5 Mbps at 1080p**; medium **1.2–3.5 Mbps at 720p**; low **0.5–1.2 Mbps at 720p** | Explicit source-plus-renditions framework. Publisher-specific requirements still apply. | [TTD creative specifications, p. 17](https://www.thetradedesk.com/assets/global/documents/Creative_Specifications-en.pdf) |
| Adobe Advertising DSP | **720p: 1.5–2.5 Mbps; 1080p: 2.5–3.5 Mbps** | Published HD video asset requirements. Adobe separately points to additional CTV publisher requirements. | [Adobe specifications](https://experienceleague.adobe.com/en/docs/advertising/dsp/campaign-management/ads/ad-specs) |
| FreeWheel — programmatic video | Mezzanine **15–40 Mbps**; high **15 Mbps / 3 Mbps** for its 1080p/720p options; medium **1.5 Mbps at 540p**; low **0.375 Mbps at 360p**; raw **20–40 Mbps** | Calls for mezzanine, high, medium, and low media files in VAST. | [FreeWheel specifications](https://www.freewheel.com/legal/ad-policy-and-specifications) |
| Magnite — SSP | **Inventory-specific minimum and maximum** | Public documentation exposes configurable minimum/maximum bitrate fields rather than one platform-wide encoding target. Inventory constraints govern eligibility. | [Magnite documentation](https://help.magnite.com/help/glossary) |

## Suggested internal encoding presets

The following are practical recommendations synthesized from the sources above, **not universal platform requirements**. Maintain separate presets and override them for the destination and buying route.

| Preset | Practical starting point | Application |
|---|---|---|
| 1080p OLV upload | H.264 MP4, **8 Mbps** | Useful OLV submission default, consistent with Amazon’s recommendation. Override for platforms such as DV360 that request higher-quality sources. |
| 1080p premium VOD/CTV source | H.264 MP4, **25–30 Mbps CBR** | A practical starting point across several premium workflows, including Peacock via CM360 and TTD’s mezzanine range. Does not replace destination-specific requirements. |
| Prime Video source | **50 Mbps** | Separate preset matching Amazon’s recommendation. |
| Ready-to-serve renditions | Multiple resolutions and bitrates, following the destination’s ladder | Keep these separate from upload presets. CM360, TTD, and FreeWheel publish materially different ladders. |

For accompanying audio, **AAC stereo, 48 kHz, 192 kbps** is a useful submission default supported by several specifications above. Publisher loudness requirements remain separate.

## Operational considerations

### Validate the output after transcoding

A compliant high-bitrate upload does not guarantee that the ad server retains the rendition a premium publisher requires. Validate the files actually exposed in the VAST tag. Disney explicitly requires programmatic assets to remain compliant through transcoding. [Disney/Hulu specifications](https://products.disneyadvertising.com/video-commercial/)

### Check bitrate, duration, and file size together

Approximate file size:

```text
File size (MB) ≈ (video Mbps + audio Mbps) × duration in seconds ÷ 8
```

A 30-second ad at 25 Mbps video is approximately **94 MB before audio/container overhead**. At 50 Mbps, it is approximately **188 MB**.

### Label every requirement precisely

For an internal specification sheet, identify:

- Whether the bitrate is a **minimum, recommended target, permitted range, or maximum**.
- Whether it applies to the **upload, mezzanine, or playback rendition**.
- Resolution, codec, frame rate, and CBR/VBR requirements.
- Publisher, buying route, and relevant file-size limit.
- Source URL and date checked.

This distinction explains most apparent contradictions across specifications. These advertising asset requirements should not be confused with consumer internet-speed recommendations or the bitrate of the surrounding VOD programming.
