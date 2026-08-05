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
  BorderStyle,
} from "docx"
import { saveAs } from "file-saver"

// Creates one delivery slip inside a bordered box
function createDeliverySlip(delivery) {
  const streetAddress = [delivery.addressLine1, delivery.addressLine2]
    .filter(Boolean)
    .join(", ")
  const cityLine = [delivery.city, delivery.district]
    .filter(Boolean)
    .join(", ")
  const course = delivery.enrollment?.course?.title || "N/A"

  const slipContent = [
    // Name
    new Paragraph({
      children: [
        new TextRun({
          text: delivery.fullName,
          bold: true,
          size: 28,
          font: "Calibri",
        }),
      ],
      spacing: { before: 60, after: 60 },
    }),
    // Street address
    new Paragraph({
      children: [
        new TextRun({
          text: streetAddress,
          size: 22,
          font: "Calibri",
        }),
      ],
      spacing: { after: 40 },
    }),
    // City, district
    new Paragraph({
      children: [
        new TextRun({
          text: cityLine,
          size: 22,
          font: "Calibri",
        }),
      ],
      spacing: { after: 40 },
    }),
    // Postal code
    new Paragraph({
      children: [
        new TextRun({
          text: delivery.postalCode || "",
          size: 22,
          font: "Calibri",
        }),
      ],
      spacing: { after: 60 },
    }),
    // Phone
    new Paragraph({
      children: [
        new TextRun({
          text: delivery.phone,
          size: 22,
          font: "Calibri",
        }),
      ],
      spacing: { after: 60 },
    }),
    // Course
    new Paragraph({
      children: [
        new TextRun({
          text: course,
          size: 20,
          font: "Calibri",
          italics: true,
          color: "555555",
        }),
      ],
      spacing: { after: 60 },
    }),
  ]

  const border = {
    style: BorderStyle.SINGLE,
    size: 4,
    color: "333333",
  }

  // Wrap in a bordered table cell
  return [
    new Table({
      width: { size: 50, type: WidthType.PERCENTAGE },
      borders: {
        top: border,
        bottom: border,
        left: border,
        right: border,
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 100, type: WidthType.PERCENTAGE },
              margins: {
                top: 100,
                bottom: 100,
                left: 150,
                right: 150,
              },
              children: slipContent,
            }),
          ],
        }),
      ],
    }),
    // Spacer between slips
    new Paragraph({ text: "", spacing: { after: 200 } }),
  ]
}

export async function generateDeliveryWordDocument(deliveries, filterLabel) {
  const allSlips = deliveries.flatMap((delivery) =>
    createDeliverySlip(delivery)
  )

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 500,
              right: 600,
              bottom: 500,
              left: 600,
            },
          },
        },
        children: allSlips,
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  const dateStr = new Date().toISOString().split("T")[0]
  const filename = `Deliveries_${filterLabel ? filterLabel + "_" : ""}${dateStr}.docx`
  saveAs(blob, filename)
}
