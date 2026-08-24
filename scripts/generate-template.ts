/**
 * 生成产品导入 Excel 模板
 *
 * 用法：npx tsx scripts/generate-template.ts [输出路径]
 * 默认输出到 ./products-template.xlsx
 */

import * as XLSX from "xlsx";
import path from "path";

const outputPath = process.argv[2] || path.join(process.cwd(), "products-template.xlsx");

// 模板数据（含示例行）
const templateData = [
  {
    title: "LED Video Light Panel 60W",
    slug: "", // 留空自动生成
    category: "Lighting",
    subCategory: "LED Panel",
    image: "product-main.jpg",
    gallery: "gallery-1.jpg|gallery-2.jpg|gallery-3.jpg",
    detailImages: "detail-1.jpg|detail-2.jpg",
    shortDescription: "Professional 60W LED video light with bi-color temperature",
    overview: "<p>The FBW-60W is a professional LED video light designed for studio and on-location shooting. Featuring 60W output power and bi-color temperature adjustment from 3200K to 5600K.</p>",
    features: "60W high brightness output\nBi-color 3200K-5600K\nCRI 95+ TLCI 97+\nDMX512 control support\nBuilt-in 12 lighting effects",
    applications: "Studio photography\nVideo production\nLive streaming\nPortrait shooting\nProduct photography",
    specs: JSON.stringify([
      {
        model: "FBW-60W",
        specs: [
          { label: "Power", value: "60W" },
          { label: "Color Temperature", value: "3200K-5600K" },
          { label: "CRI", value: "95+" },
          { label: "Brightness", value: "6500lux @1m" },
          { label: "Power Supply", value: "DC 15V/4A" },
        ],
      },
    ]),
    video: "",
    seoTitle: "60W LED Video Light Panel | Professional Studio Lighting",
    metaDescription: "Professional 60W bi-color LED video light panel with CRI 95+, DMX control, and 12 lighting effects for studio and video production.",
    focusKeywords: "LED video light, 60W studio light, bi-color LED panel, professional lighting",
    hiddenSeoText: "FOTOBESTWAY professional 60W LED video light panel, ideal for studio photography, videography, and live streaming applications.",
    imageAlt: "FBW 60W LED Video Light Panel product photo",
  },
  {
    title: "Light Stand 2.8m Heavy Duty",
    slug: "",
    category: "Stand",
    subCategory: "Light Stand",
    image: "stand-main.jpg",
    gallery: "stand-gallery-1.jpg|stand-gallery-2.jpg",
    detailImages: "",
    shortDescription: "Heavy duty 2.8m aluminum light stand with air cushion",
    overview: "<p>Professional heavy duty light stand with maximum height 2.8m, constructed from high-strength aluminum alloy with air cushion system for safe operation.</p>",
    features: "Max height 2.8m\nAir cushion system\nAluminum alloy construction\nMax load 8kg\nFoldable design",
    applications: "Studio lighting setup\nOutdoor shooting\nVideo production\nEvent photography",
    specs: "=== FBW-LS280 ===\nMax Height: 2.8m\nMin Height: 0.8m\nMax Load: 8kg\nWeight: 2.5kg\nMaterial: Aluminum Alloy",
    video: "",
    seoTitle: "",
    metaDescription: "",
    focusKeywords: "",
    hiddenSeoText: "",
    imageAlt: "",
  },
];

const worksheet = XLSX.utils.json_to_sheet(templateData);

// 设置列宽
const colWidths = [
  { wch: 30 }, // title
  { wch: 25 }, // slug
  { wch: 15 }, // category
  { wch: 18 }, // subCategory
  { wch: 20 }, // image
  { wch: 35 }, // gallery
  { wch: 35 }, // detailImages
  { wch: 40 }, // shortDescription
  { wch: 50 }, // overview
  { wch: 40 }, // features
  { wch: 40 }, // applications
  { wch: 60 }, // specs
  { wch: 20 }, // video
  { wch: 40 }, // seoTitle
  { wch: 50 }, // metaDescription
  { wch: 40 }, // focusKeywords
  { wch: 50 }, // hiddenSeoText
  { wch: 30 }, // imageAlt
];
worksheet["!cols"] = colWidths;

const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

XLSX.writeFile(workbook, outputPath);

console.log("模板已生成:", outputPath);
console.log("");
console.log("列说明:");
console.log("  title*           - 产品标题（必填）");
console.log("  slug             - URL别名（留空自动生成）");
console.log("  category*        - 一级分类（必填，需已存在）");
console.log("  subCategory      - 二级分类（需已存在）");
console.log("  image            - 主图文件名");
console.log("  gallery          - Gallery图，多个用 | 分隔");
console.log("  detailImages     - 详情图，多个用 | 分隔");
console.log("  shortDescription - 简短描述");
console.log("  overview         - 产品概述（支持HTML）");
console.log("  features         - 特性，每行一条");
console.log("  applications     - 应用场景，每行一条");
console.log("  specs            - 规格参数（JSON或 ===型号=== 格式）");
console.log("  video            - 视频URL");
console.log("  seoTitle         - SEO标题");
console.log("  metaDescription  - Meta描述");
console.log("  focusKeywords    - 关键词，逗号分隔");
console.log("  hiddenSeoText    - 隐藏SEO文本");
console.log("  imageAlt         - 主图Alt文本");
console.log("");
console.log("specs 两种格式:");
console.log("  格式1 (JSON): [{\"model\":\"型号\",\"specs\":[{\"label\":\"参数\",\"value\":\"值\"}]}]");
console.log("  格式2 (文本):");
console.log("    === 型号A ===");
console.log("    参数1: 值1");
console.log("    参数2: 值2");
