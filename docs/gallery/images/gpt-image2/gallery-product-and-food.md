# 产品与美食

### 由刀版图生成 3D 产品包装盒

<img src="assets/product-food/product-dieline-box.png" alt="product dieline box" width="420"/>

```text
把这张刀版图（dieline）组装成一个完美的 3D 包装盒：各面板准确、折痕干净、文字不变形，图案完全保留原样。将盒子直立摆放，以考究的四分之三角度拍摄，置于极简高级的影棚环境中：柔和的中性背景、漫射光、细微阴影、无道具、色彩真实、哑光纸板质感、写实的杂志级细节。盒子正面以干净的无衬线字体写着 "AURAE / COLD-BREW MATCHA / 12 fl oz"。侧面板上是 8pt 字号的小号配料表，以及营养成分表样式的信息块。干净、杂志感、获奖级的产品静物照（packshot）美学。
```

### 巧克力威化产品渲染（JSON 风格）

<img src="assets/product-food/product-chocolate-wafer.png" alt="product chocolate wafer" width="420"/>

```text
/* 产品渲染配置：巧克力威化 榛子版
   版本：2.0.1
   美学：高端商业美食摄影 */

{
  "ENVIRONMENT": {
    "Background": "渐变(暗暖棕)",
    "Atmospheric_FX": ["漂浮微粒", "景深模糊", "电影感焦外光斑"],
    "Lighting": { "Type": "偏暖定向影棚光", "Highlights": "镜面光泽反射", "Shadow_Softness": "高" }
  },
  "CORE_ASSETS": {
    "Primary_Subject": "威化卷",
    "Physics": "零重力对角 X 形构图",
    "Material_Properties": {
      "Outer": "牛奶巧克力涂层",
      "Surface_Texture": "嵌有不规则坚果碎块",
      "Interior_Cross_Section": { "Structure": "酥脆中空威化", "Core": "丝滑巧克力奶油夹心" }
    }
  },
  "PARTICLE_SYSTEMS": [
    { "Object": "巧克力块", "Detail": "矩形、压印字母 B", "State": "漂浮" },
    { "Object": "榛子", "State": "对半切开并碎裂", "Distribution": "随机环绕" }
  ],
  "FLUID_DYNAMICS": { "Element": "巧克力飞溅", "Behavior": "作为动态背景流动", "Viscosity": "浓稠有光泽" },
  "RENDER_OUTPUT": { "Resolution": "8K_UHD", "Aspect_Ratio": "3:4", "Quality_Flags": ["超写实", "前景锐利", "诱人放纵的氛围"] }
}
```

### 沙拉爆炸美食摄影（JSON 风格）

<img src="assets/product-food/food-salad-explosion.png" alt="food salad explosion" width="420"/>

```text
{
  "global_settings": {
    "resolution": "8K 超高清",
    "aspect_ratio": "2:3 竖版",
    "style": "超写实美食摄影",
    "clarity": "极致锐利，微观纹理清晰可见",
    "motion": "定格动作，食材悬浮空中",
    "lighting_quality": "影棚级、高反差、电影感"
  },
  "scene_description": "一场动感的沙拉爆炸，从放在圆形木质台面上的哑光黑碗中迸发而出。食材悬在半空，向上、向外四散飞开，每一样食材都被一盏定向主光照亮，突出表面的水润感。",
  "ingredients_visible": [
    "绿色生菜叶", "樱桃番茄（整颗和切片）", "排成弧形叠放的黄瓜片",
    "黑橄榄", "白色奶酪丁", "橙色柑橘切片", "小朵西兰花",
    "新鲜绿色罗勒叶", "一缕正在下落途中被定格的橄榄油"
  ],
  "motion_details": {
    "ingredients": "定格在弧线途中，略微旋转，部分带轻微动态模糊以表现运动",
    "particles": "细小的橄榄油滴和水珠漂浮在食材之间",
    "bowl": "完全静止，哑光黑，吸收高光"
  },
  "environment": { "background": "从米白柔和过渡到暖米色", "surface": "原色橡木圆形切面" },
  "render_flags": ["获奖级美食摄影", "看不出 CGI 痕迹", "杂志级食谱封面质感"]
}
```

### 通用商业海报模板

<img src="assets/product-food/aurora-oolong-poster.png" alt="aurora oolong poster" width="420"/>

```text
为一款名为 "Aurora Oolong Cold Brew" 的产品设计一张高端商业海报。极简风格，画面干净，主角瓶身与茶杯居中，柔和的影棚光，写实的材质质感，优雅的冷凝水珠细节，大面积留白，高级品牌视觉语言，电影感光影，考究的包装字体排印，超精细的完成度。让它看起来像一支奢华饮品广告，可以投放在地铁灯箱或时尚杂志上。
```

<img src="assets/product-food/aurora-oolong-sunburst.png" alt="Sunburst Aurora Oolong Cold Brew bottle and tea glass commercial scene" width="420"/>
