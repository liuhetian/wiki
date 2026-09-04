<!--
  上游原文存档，勿改。
  标题：Oryzo BTS (Part 2 / 7) - 3D Design and Motion Graphics
  出处：https://blog.lusion.co/oryzo-bts-part-2-7-3d-design-and-motion-graphics
  作者：Edan Kwan / Paul Catoera（Lusion）
  取得：2026-09-04，Hashnode 的 .md 源（原 URL 后加 .md）
  处理：只移除了正文里内嵌的 base64 封面图（各 300KB+），文字一字未动。
  为什么存：博客不是开源仓库，没有 commit 可钉；正文里对它的引述要能复核，
  就只能自己留一份。拆解正文见 ../../index.md。
-->

# Oryzo BTS  (Part 2 / 7) - 3D Design and Motion Graphics

If you have not seen Oryzo AI in action yet, I would recommend checking it out first - [**oryzo.ai**](http://oryzo.ai). It is, quite honestly, five minutes of your life gloriously wasted for a nerdy laugh.

If [Part 1](https://blog.lusion.co/oryzo-bts-part-1-7-concept-and-creative-direction) was about concept and creative direction, this is where the visual world started to take shape. In addition to the main website scenes, we also developed a full set of campaign assets, including a [prelaunch video](https://x.com/lusionltd/status/2033564065096753180), a [launch film](https://x.com/lusionltd/status/2034723323637092533?s), and a range of behind the scenes content. So this post is naturally a more visual one, full of 3D experiments, motion studies, and production tests.

![](https://cdn.hashnode.com/uploads/covers/69c11fef545ab96312724825/46100483-19dd-423c-83d3-4cb10270f4ea.webp align="center")

At Lusion, we care more about the final experience than any particular tool. The pipeline follows the idea, not the other way around. That principle has led us to use a wide mix of software depending on what each project actually needs.

For Oryzo, which relied heavily on 3D imagery and motion, we primarily used [SideFX Houdini](https://www.sidefx.com/products/houdini/) for scene building and [Maxon Redshift](https://www.maxon.net/en/redshift) for rendering. Houdini, while traditionally associated with visual effects in the Hollywood movies, has become a core part of our workflow for building flexible systems that translate well into interactive web work. Redshift, being GPU accelerated, gave us the speed we needed to iterate quickly on lighting, textures, and final renders.

With that foundation in place, the next step was to define the main visual anchors of the campaign.

* * *

## The Hero Scene

![](https://cdn.hashnode.com/uploads/covers/69c11fef545ab96312724825/d9eeebee-9260-4845-a04f-428fec2881c6.png align="center")

We needed a setting that could hold the coaster naturally while also helping establish the tone of the project.

A desk felt like the obvious choice.

It became the hero scene of the entire campaign: warm, calm, and filled with objects that would feel familiar to designers and other visually minded people. We wanted to create an environment that felt curated and believable enough to support the absurd seriousness of the product presentation.

We explored several directions before landing on the final look. Here are a few early tests:

![](https://cdn.hashnode.com/uploads/covers/69c11fef545ab96312724825/0bf0a49a-a9ee-43c5-8c5b-6a2306532e56.jpg align="center")

![](https://cdn.hashnode.com/uploads/covers/69c11fef545ab96312724825/0405cbc2-627b-4c04-a3a6-7a38decae5d8.jpg align="center")

In the end, we settled on the work desk because it felt the most personal to us. It reflected the kind of space we know well, somewhere between digital tools and analogue mess, between design work and everyday objects.

![](https://cdn.hashnode.com/uploads/covers/69c11fef545ab96312724825/9995c4f8-a84d-4cbd-becd-c544a579406c.jpg align="center")

One of the biggest technical challenges was preserving the fidelity of that scene once it moved into a web based environment. We tried image sequences and video, but they lacked the interactivity we wanted. We also tested real time PBR rendering, but it did not quite reach the visual quality we were aiming for.

So we explored Gaussian Splatting as a way to translate high quality rendered scenes into something that could still run in real time with WebGL. We tested two tools for this workflow: Jawset’s [Postshot](https://www.jawset.com/) (paid) and the open source [Lichtfeld Studio](https://github.com/MrNeRF/LichtFeld-Studio) (free).

In most of our production tests, Postshot gave us better quality and faster processing times. That said, Lichtfeld Studio has continued to improve and now includes features like LOD support, so it is still very much worth exploring.

![](https://cdn.hashnode.com/uploads/covers/69c11fef545ab96312724825/9ee54f34-79da-406b-a8e8-c6d925fd6a53.gif align="center")

To generate the dataset, we rendered multiple camera perspectives in Houdini and processed them through Postshot to create the splats. We also split the scene into multiple splats for compositing inside the web experience, which we will talk about more in later parts.

> At first, we made the classic mistake of trying to be too clever.

Because Oryzo.ai is a linear scrolling web experience, we assumed the best dataset would come from rendering the exact camera spline used in the final website. In theory, that sounded efficient. In practice, it reduced the quality of the result. Too many nearly identical frames during eased camera motion meant weaker coverage in the areas that actually needed more variation.

The better solution turned out to be the simpler one: standard hemispherical or spherical camera placement.

![](https://cdn.hashnode.com/uploads/covers/69c11fef545ab96312724825/e810b0f0-9a59-4ad3-9c3b-cb1a16a83090.png align="center")

Postshot requires both images and COLMAP data. With real world scans, Postshot can estimate this itself, or you can use tools like RealityScan to improve the tracking. But in our case, because the images were rendered in Houdini, the camera data already existed.

That meant we could export it directly.

To streamline that process, we used [GSOPs](https://github.com/cgnomads/GSOPs), a third party Houdini toolset for Gaussian splats, which made it much easier to export COLMAP data and move efficiently from Houdini into Postshot.

![](https://cdn.hashnode.com/uploads/covers/69c11fef545ab96312724825/a05e0df6-ed39-4f01-9b2f-984b25841cb7.gif align="center")

The scene itself was built through a mix of sourced assets and custom work. Some areas, like the background trays, included many small objects that would have been tedious to place manually. For those, we used rigid body simulations to let the objects settle naturally into place.

That is often how these workflows unfold. Large forms come together quickly, then the smaller details demand much more specific, and sometimes slightly strange, solutions.

> One Trick Pony Does Not Work

We tried rendering the entire scene as Gaussian splats:

![](https://cdn.hashnode.com/uploads/covers/69bd2d832ff723725f185c76/fc4d05db-07aa-4460-9a29-d1b213f47a44.webp align="center")

We pushed it to around 900,000 splats already, but if you look closely at the desk and the cutting mat, you can still see plenty of flaws in the wooden details and the fine sketch lines.

That led us to a hybrid solution.

We used splats only for the props and the desk reflections. Once we narrowed the splat content to the elements that actually benefited from it, the result immediately looked better, even with far fewer points: around 78,233 splats on desktop and 44,683 on mobile.

![](https://cdn.hashnode.com/uploads/covers/69bd2d832ff723725f185c76/fc190f1c-423f-482f-888e-471f61637fc4.png align="center")

For the rest of the scene, we fell back to simpler texture mapping. Even there, we used several tricks to preserve visual quality while keeping the overall file size under control.

For the desk and the mat, we simplified the geometry and merged them together. Redshift does not let you directly bake displacement or tessellation detail into a texture map in the way we wanted, so instead of baking, we rendered orthographic passes from the top and front without reflections, then stitched them back together in Photoshop.

Because the camera spends most of its time focused around the centre of the desk, we also added a shader pass to distort the texture coverage so that the centre 50 percent of the surface received roughly 90 percent of the available texture detail.

![](https://cdn.hashnode.com/uploads/covers/69bd2d832ff723725f185c76/291383b5-8b20-4c7f-abd5-5aeda30da617.webp align="center")

![](https://cdn.hashnode.com/uploads/covers/69bd2d832ff723725f185c76/b6ce2c1c-6b47-4892-9e69-f87a2fc82d76.webp align="center")

* * *

## Human Interface

![](https://cdn.hashnode.com/uploads/covers/69c11fef545ab96312724825/00514007-2788-486c-8352-8bc1be0d9005.png align="center")

One of the clearest visual references in Oryzo came from the way premium tech campaigns use hands.

That kind of imagery is familiar from product advertising, especially in Apple campaigns, where human interaction is used to make digital objects feel tactile, minimal, and desirable. We wanted to borrow some of that visual language and reinterpret it for our own purposes.

The result was the six finger hand scene.

We started from a high quality 3D scan of a real hand that we purchased from [3D Scan Store](https://www.3dscanstore.com/hand-3d-model/all-model-hands-section/female-3d-hand-model-black-20), then modified it to give it one extra finger.

![](https://cdn.hashnode.com/uploads/covers/69bd2d832ff723725f185c76/6076fa31-7ec5-4839-ba46-c3f698ba256e.webp align="center")

We then built a rig in Houdini using **KineFX**. Even though rigging can become very complex, the motion we needed was fairly contained, so a relatively simple setup was enough to give us the control we wanted.

![](https://cdn.hashnode.com/uploads/covers/69c11fef545ab96312724825/a5e3035e-83ba-4dac-83ba-9795ae225607.png align="center")

![](https://cdn.hashnode.com/uploads/covers/69c11fef545ab96312724825/ce6e895b-6cd5-4b1e-9789-ef4dc4d2fc8c.gif align="center")

What mattered most here was not technical complexity for its own sake, but the feeling of physical intent. The hand needed to move with just enough realism to sell the premium presentation, while still leaving room for the joke to land.

* * *

## Function Reimagined

![](https://cdn.hashnode.com/uploads/covers/69c11fef545ab96312724825/089a7fe1-ceb0-4ecd-b0bf-720153aa0e5f.webp align="center")

Once the core visual language was in place, we started looking for ways to stretch the product concept further.

One of those directions was the idea of making the coaster feel “wearable.” Premium products never just sell specifications. They sell lifestyle, identity, and status. Somehow, following that line of thinking led us to the condom wrapper packaging scene.

![](https://cdn.hashnode.com/uploads/covers/69c11fef545ab96312724825/dfa9facd-8b13-4eb8-b9fb-04f06444556b.webp align="center")

For the packaging, we used Houdini’s Vellum system to simulate realistic stretching and material behaviour. You could approach this with sculpting or more traditional polygon modelling, but simulation made more sense for us because we already knew the geometry would need to tear later.

That made the process feel closer to a real material study rather than a purely static model.

We used two planes with different physical properties to represent two different materials. The front side was a flimsy transparent plastic with lower stiffness. The back side was a soft metallic layer that was stiffer and more resistant to bending. We then applied attraction forces that behaved like a vacuum seal. To add more realism and wrinkling, the attraction force on the upper layer was multiplied by a noise distorted radial wave pattern, as shown below.

![](https://cdn.hashnode.com/uploads/covers/69c11fef545ab96312724825/c860bc9a-b7a9-4f6e-8524-dc1421cadff8.webp align="center")

The tearing animation was also driven by Vellum. We split the mesh into separate sections, stitched them back together with **weld constraints**, and let those constraints break dynamically once they reached their stress limits. By animating the initial separation, the solver handled the rest and produced a tearing motion that felt much more natural than a hand animated effect would have.

![](https://cdn.hashnode.com/uploads/covers/69c11fef545ab96312724825/47828e92-279c-4ae5-92e1-ba66726d9a95.webp align="center")

* * *

## Inside the Material

As part of the storytelling, we wanted to talk about the material qualities of cork at a microscopic level. That led us to create a close up render as the main background, paired with an interactive microscopic view box for a more detailed material reveal.

![](https://cdn.hashnode.com/uploads/covers/69bd2d832ff723725f185c76/a38b8479-8e3e-4420-828d-479caa91b5c4.webp align="center")

For the macro render, we first developed an early look development pass that looked something like this:

![](https://cdn.hashnode.com/uploads/covers/69bd2d832ff723725f185c76/796d908b-a193-4578-8511-dabb45f18913.webp align="center")

The cork itself was built using a VDB modelling setup combined with procedural noise to create the right look and feel. It already felt visually convincing, but then we pushed it further by treating it as a microscopic world that also needed to loop seamlessly across the horizontal scroll.

That turned out to be particularly challenging. We had to pay close attention to seam handling and rely on periodic noise so that both the vertex positions and the surface normals would transition cleanly across the loop.

![](https://cdn.hashnode.com/uploads/covers/69bd2d832ff723725f185c76/684318cc-2a03-4e81-8988-0f8a01b77e9f.webp align="center")

We also added a small Easter egg in this interactive section. If you drag and shake the microscopic view rapidly, a water bear appears.

![](https://cdn.hashnode.com/uploads/covers/69bd2d832ff723725f185c76/36977060-e17f-4937-80e2-b2257ec2585a.webp align="center")

To create that asset, we experimented with an AI assisted pipeline. We generated multiple reference views using Nano Banana Pro via [Google Flow](https://labs.google/fx/tools/flow/), processed them through [Hunyuan’s 3D generator](https://3d.hunyuan.tencent.com/), then refined the result in ZBrush and added procedural detailing before baking it back into textures.

![](https://cdn.hashnode.com/uploads/covers/69c11fef545ab96312724825/e7bd37d9-d906-4ef9-ab14-23e5581f6dcf.webp align="center")

* * *

## Grounded in the Real

The more we worked on the project, the more important it felt to ground some of the visuals in something physically real.

When we looked more closely at the material, we were reminded that cork comes from the outer bark of cork oak trees. That gives it a strong tactile and ecological identity. Rather than relying entirely on pre made models or purely generated assets, we wanted to bring some of that material truth directly into the campaign.

So we bought a piece of cork bark from Amazon, mounted it on a tripod setup, and photographed it for photogrammetry using a digital camera in RAW.

![](https://cdn.hashnode.com/uploads/covers/69c11fef545ab96312724825/5750c39c-852c-4610-be0b-3ffbcc4d25c8.webp align="center")

We captured around 180 high resolution images to give us enough coverage for accurate geometry and texture reconstruction. Those images were then processed in [RealityScan](https://www.realityscan.com/) to generate the mesh and texture maps.

From there, we refined the result further with subtle procedural surface treatment to improve the richness of the close up renders.

That scanned bark ended up becoming an important visual ingredient not only in the website, but also in the film and promotional assets.

![](https://cdn.hashnode.com/uploads/covers/69bd2d832ff723725f185c76/e000a540-f52e-4a90-8159-2df0f802d842.webp align="center")

![](https://cdn.hashnode.com/uploads/covers/69bd2d832ff723725f185c76/554bc642-9cef-4860-8613-264a505bfa0e.webp align="center")

* * *

## The Film

By the time we moved into the launch film, most of the visual ingredients were already there.

The goal of the film was to distill them into something simple, premium, and cinematic, taking cues from luxury technology product videos without overcomplicating the structure.

We opened with a sequence focused on how cork is traditionally produced, using the same scanned bark asset to anchor the story in something tangible and material.

From there, the film transitions into a more stylised world. The disintegration effect was created using VDB mesh booleans, particle simulations, and pyro smoke, allowing the material to shift from natural object into designed spectacle.

The following sequence uses a textured backdrop generated in Copernicus, Houdini’s GPU accelerated image processing system, inspired in part by Jose Molfino’s [experiments](https://x.com/Jose_Molfino/status/1894125340122837073) translating TouchDesigner style techniques into COPs.

The remaining shots are relatively restrained. They rely less on technical novelty and more on timing, composition, and motion. That was intentional. For a product film like this, the challenge is often not adding more, but knowing when to stop.

And in a way, that idea runs through the whole project.

Even when the product is absurd, the craft still works best when it is controlled.

%[https://www.youtube.com/watch?v=0PZPwjqYViw] 

* * *

## Closing Thoughts

By this stage, Oryzo had already become much more than a single coaster render. It had grown into a full visual system spanning the website, campaign content, and launch film. What made that possible was not any one trick, but the way all of these pieces were shaped to support the same tone.

In Part 3, we will go deeper into the website flow, illustration, and UI design decisions that helped bring that tone into the interactive experience.

* * *

## Oryzo Behind the Scene Series

We will be publishing the rest of the Oryzo behind the scenes series over the next few days. If you enjoyed this post, feel free to bookmark it or subscribe for the upcoming parts.

[☑ Oryzo BTS (Part 1 / 7) - Concept and Creative Direction](https://blog.lusion.co/oryzo-bts-part-1-7-concept-and-creative-direction)

**☑ Oryzo BTS (Part 2 / 7) - 3D Design and Motion Graphics**

[**☑** Oryzo BTS (Part 3 / 7) - Website UX/UI and Illustrations](https://blog.lusion.co/oryzo-bts-part-3-7-website-ux-ui-and-illustrations)

*☐ Oryzo BTS (Part 4 / 7) - WebGL/ThreeJS Tricks 1*

*☐ Oryzo BTS (Part 5 / 7) - WebGL/ThreeJS Tricks 2*

*☐ Oryzo BTS (Part 6 / 7) - WebGL/ThreeJS Tricks 3*

*☐ Oryzo BTS (Part 7 / 7) - WebGL/ThreeJS Tricks 4*
