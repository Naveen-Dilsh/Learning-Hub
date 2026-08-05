"use client"

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  HeadingLevel,
  ShadingType,
} from "docx"
import { saveAs } from "file-saver"

const STATUS_LABELS = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
}

function formatDate(dateStr) {
  if (!dateStr) return "N/A"
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function buildAddress(delivery) {
  return [
    delivery.addressLine1,
    delivery.addressLine2,
    delivery.city,
    delivery.district,
    delivery.postalCode,
  ]
    .filter(Boolean)
    .join(", ")
}

// Creates a label-value row for the delivery detail table
function createDetailRow(label, value) {
  return new TableRow({
    children: [
      new TableCell({
        width: { size: 30, type: WidthType.PERCENTAGE },
        shading: { type: ShadingType.SOLID, color: "F3F4F6" },
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: label,
                bold: true,
                size: 20,
                font: "Calibri",
              }),
            ],
            spacing: { before: 60, after: 60 },
          }),
        ],
      }),
      new TableCell({
        width: { size: 70, type: WidthType.PERCENTAGE },
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: value || "N/A",
                size: 20,
                font: "Calibri",
              }),
            ],
            spacing: { before: 60, after: 60 },
          }),
        ],
      }),
    ],
  })
}

// Build a delivery details table for a single delivery
function createDeliverySection(delivery, index) {
  const address = buildAddress(delivery)
  const rows = [
    createDetailRow("Student Name", delivery.fullName),
    createDetailRow(
      "Student Number",
      delivery.enrollment?.student?.studentNumber?.toString() || "N/A"
    ),
    createDetailRow(
      "Course",
      delivery.enrollment?.course?.title || "N/A"
    ),
    createDetailRow("Phone", delivery.phone),
    createDetailRow("Email", delivery.email || "N/A"),
    createDetailRow("Address", address || "N/A"),
    createDetailRow("Status", STATUS_LABELS[delivery.status] || delivery.status),
    createDetailRow("Created Date", formatDate(delivery.createdAt)),
  ]

  // Add tracking info if available
  if (delivery.trackingNumber) {
    rows.push(createDetailRow("Tracking Number", delivery.trackingNumber))
  }
  if (delivery.courier) {
    rows.push(createDetailRow("Courier", delivery.courier))
  }
  if (delivery.shippedAt) {
    rows.push(createDetailRow("Shipped Date", formatDate(delivery.shippedAt)))
  }
  if (delivery.deliveredAt) {
    rows.push(createDetailRow("Delivered Date", formatDate(delivery.deliveredAt)))
  }
  if (delivery.notes) {
    rows.push(createDetailRow("Notes", delivery.notes))
  }

  const noBorder = {
    top: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
    left: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
    right: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
  }

  return [
    // Section header
    new Paragraph({
      children: [
        new TextRun({
          text: `${index + 1}. ${delivery.fullName}`,
          bold: true,
          size: 24,
          font: "Calibri",
        }),
        new TextRun({
          text: `  —  ${STATUS_LABELS[delivery.status] || delivery.status}`,
          size: 22,
          font: "Calibri",
          italics: true,
          color: delivery.status === "DELIVERED" ? "16A34A" : delivery.status === "CANCELLED" ? "DC2626" : "6B7280",
        }),
      ],
      spacing: { before: 300, after: 100 },
    }),
    // Detail table
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: noBorder,
      rows,
    }),
    // Spacer
    new Paragraph({ text: "", spacing: { after: 100 } }),
  ]
}

export async function generateDeliveryWordDocument(deliveries, filterLabel) {
  // Count by status
  const statusCounts = {}
  deliveries.forEach((d) => {
    statusCounts[d.status] = (statusCounts[d.status] || 0) + 1
  })

  const summaryLines = Object.entries(STATUS_LABELS)
    .map(([key, label]) => `${label}: ${statusCounts[key] || 0}`)
    .join("  |  ")

  // Build all delivery sections
  const deliverySections = deliveries.flatMap((delivery, index) =>
    createDeliverySection(delivery, index)
  )

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,    // 0.5 inch
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children: [
          // Title
          new Paragraph({
            children: [
              new TextRun({
                text: "Delivery Details Report",
                bold: true,
                size: 36,
                font: "Calibri",
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 100 },
          }),
          // Subtitle with date and filter
          new Paragraph({
            children: [
              new TextRun({
                text: `Generated: ${new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}`,
                size: 20,
                font: "Calibri",
                color: "6B7280",
              }),
              ...(filterLabel
                ? [
                    new TextRun({
                      text: `  |  Filter: ${filterLabel}`,
                      size: 20,
                      font: "Calibri",
                      color: "6B7280",
                      italics: true,
                    }),
                  ]
                : []),
            ],
            spacing: { after: 100 },
          }),
          // Summary counts
          new Paragraph({
            children: [
              new TextRun({
                text: `Total: ${deliveries.length} deliveries  —  ${summaryLines}`,
                size: 20,
                font: "Calibri",
                color: "374151",
              }),
            ],
            spacing: { after: 200 },
          }),
          // Horizontal line
          new Paragraph({
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 6, color: "D1D5DB" },
            },
            spacing: { after: 200 },
          }),
          // All delivery sections
          ...deliverySections,
          // Footer
          new Paragraph({
            border: {
              top: { style: BorderStyle.SINGLE, size: 6, color: "D1D5DB" },
            },
            spacing: { before: 300, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "— End of Report —",
                size: 18,
                font: "Calibri",
                color: "9CA3AF",
                italics: true,
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
        ],
      },
    ],
  })

  // Generate and download
  const blob = await Packer.toBlob(doc)
  const dateStr = new Date().toISOString().split("T")[0]
  const filename = `Delivery_Details_${filterLabel ? filterLabel + "_" : ""}${dateStr}.docx`
  saveAs(blob, filename)
}
