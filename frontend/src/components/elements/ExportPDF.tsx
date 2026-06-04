"use client";

import React, { useState, useEffect } from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";
import { Download, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExportPDFProps {
  post: {
    title: string;
    category: string;
    excerpt: string;
    htmlContent: string;
    authorId: {
      name: string;
    };
    createdAt: string;
  };
}

// 1. Stylesheet for the PDF document
const styles = StyleSheet.create({
  page: {
    paddingTop: 75,
    paddingBottom: 65,
    paddingHorizontal: 45,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
  },
  header: {
    position: "absolute",
    top: 30,
    left: 45,
    right: 45,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    fontSize: 8,
    color: "#64748b",
    fontWeight: "bold",
  },
  headerRight: {
    fontSize: 8,
    color: "#94a3b8",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 45,
    right: 45,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerLeft: {
    fontSize: 8,
    color: "#94a3b8",
  },
  footerRight: {
    fontSize: 8,
    color: "#64748b",
    fontWeight: "bold",
  },
  titleContainer: {
    marginTop: 15,
    marginBottom: 10,
  },
  categoryBadge: {
    fontSize: 9,
    color: "#1e3a8a",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: "flex-start",
    marginBottom: 8,
    textTransform: "uppercase",
    fontWeight: "bold",
  },
  title: {
    fontSize: 22,
    color: "#0f172a",
    fontWeight: "bold",
    lineHeight: 1.25,
  },
  metaBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingBottom: 12,
    marginBottom: 20,
  },
  authorText: {
    fontSize: 9,
    color: "#334155",
    fontWeight: "bold",
  },
  dateText: {
    fontSize: 9,
    color: "#64748b",
  },
  excerptContainer: {
    backgroundColor: "#f8fafc",
    borderLeftWidth: 3,
    borderLeftColor: "#cbd5e1",
    padding: 12,
    borderRadius: 4,
    marginBottom: 25,
  },
  excerptText: {
    fontSize: 10,
    color: "#475569",
    lineHeight: 1.5,
    fontStyle: "italic",
  },
  contentContainer: {
    flexDirection: "column",
  },
  paragraph: {
    fontSize: 10.5,
    color: "#334155",
    lineHeight: 1.6,
    marginBottom: 12,
    textAlign: "justify",
  },
  heading2: {
    fontSize: 14,
    color: "#1e293b",
    fontWeight: "bold",
    marginTop: 18,
    marginBottom: 8,
  },
  heading3: {
    fontSize: 12,
    color: "#334155",
    fontWeight: "bold",
    marginTop: 14,
    marginBottom: 6,
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 6,
    paddingLeft: 10,
  },
  bulletPoint: {
    width: 10,
    fontSize: 10.5,
    color: "#334155",
  },
  listItemText: {
    flex: 1,
    fontSize: 10.5,
    color: "#334155",
    lineHeight: 1.5,
  },
});

// 2. Simple Helper to Parse HTML tags from Editor content into PDF structured blocks
const parseHtmlToPdf = (html: string) => {
  if (!html) return [];
  const blocks: { tag: string; text: string }[] = [];
  const regex = /<(p|h2|h3|li)[^>]*>(.*?)<\/\1>/gi;
  let match;
  let hasMatches = false;

  while ((match = regex.exec(html)) !== null) {
    hasMatches = true;
    const tag = match[1].toLowerCase();
    const text = match[2]
      .replace(/<[^>]+>/g, "") // Strip inline tags (e.g. strong, em, code)
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .trim();

    if (text) {
      blocks.push({ tag, text });
    }
  }

  // Fallback: strip tags and render as single paragraph if format is flat text
  if (!hasMatches) {
    const text = html
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();
    if (text) {
      blocks.push({ tag: "p", text });
    }
  }

  return blocks;
};

// 3. Declarative PDF Document structure
const MyPDFDocument = ({ post }: ExportPDFProps) => {
  const contentBlocks = parseHtmlToPdf(post.htmlContent);
  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Recurring Custom Header */}
        <View style={styles.header} fixed>
          <Text style={styles.headerLeft}>Corporate Engineering Hub</Text>
          <Text style={styles.headerRight}>
            {post.title.length > 40 ? post.title.slice(0, 37) + "..." : post.title}
          </Text>
        </View>

        {/* Title & Metadata Area */}
        <View style={styles.titleContainer}>
          <Text style={styles.categoryBadge}>{post.category}</Text>
          <Text style={styles.title}>{post.title}</Text>
        </View>

        <View style={styles.metaBar}>
          <Text style={styles.authorText}>Author: {post.authorId.name}</Text>
          <Text style={styles.dateText}>Published: {formattedDate}</Text>
        </View>

        {/* Brief Excerpt Callout */}
        <View style={styles.excerptContainer}>
          <Text style={styles.excerptText}>{post.excerpt}</Text>
        </View>

        {/* Dynamic Parsed Article Content Blocks */}
        <View style={styles.contentContainer}>
          {contentBlocks.map((block, index) => {
            if (block.tag === "h2") {
              return (
                <Text key={index} style={styles.heading2}>
                  {block.text}
                </Text>
              );
            }
            if (block.tag === "h3") {
              return (
                <Text key={index} style={styles.heading3}>
                  {block.text}
                </Text>
              );
            }
            if (block.tag === "li") {
              return (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.listItemText}>{block.text}</Text>
                </View>
              );
            }
            // Default paragraph rendering
            return (
              <Text key={index} style={styles.paragraph}>
                {block.text}
              </Text>
            );
          })}
        </View>

        {/* Recurring Custom Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerLeft}>Technical Library Document</Text>
          <Text
            style={styles.footerRight}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
};

// 4. Download Trigger button component
export default function ExportPDFButton({ post }: ExportPDFProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fileTitle = post.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  if (!isMounted) {
    return (
      <Button
        variant="outline"
        disabled
        className="bg-white/5 border-white/20 text-slate-400 font-semibold transition-all flex items-center gap-2 cursor-pointer"
      >
        <FileDown className="h-4 w-4" />
        <span>Loading PDF compiler...</span>
      </Button>
    );
  }

  return (
    <PDFDownloadLink
      document={<MyPDFDocument post={post} />}
      fileName={`hub-article-${fileTitle}.pdf`}
      className="inline-block"
    >
      {({ loading }) => (
        <Button
          variant="outline"
          disabled={loading}
          className="bg-white/5 border-white/20 hover:bg-white/10 text-white font-semibold transition-all flex items-center gap-2 cursor-pointer"
        >
          {loading ? (
            <>
              <FileDown className="h-4 w-4 animate-bounce" />
              <span>Generating Doc...</span>
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              <span>Download PDF Copy</span>
            </>
          )}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
