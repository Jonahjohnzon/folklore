import type { Metadata } from "next";
import { BookService } from "@/app/services/BookService";
import ChapterPage from "./Body";

type Props = { params: Promise<{ slug: string; chapterId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, chapterId } = await params;

  try {
    const { data: bookData } = await BookService.getBySlug(slug);
    const book = bookData.book;

    const title = `${book.title} — Chapter`;
    const description = `Read ${book.title}, by ${book.author.penName}, free on TipaTale.`;
    const url = `https://tipatale.com/book/${slug}/chapter/${chapterId}`;
    const image = book.coverUrl || "/opengraph.png";

    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: {
        type: "article",
        url,
        siteName: "TipaTale",
        title,
        description,
        images: [{ url: image, width: 800, height: 1200, alt: book.title }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [image],
      },
    };
  } catch {
    return {
      title: "Chapter not found",
      description: "This chapter doesn't exist or isn't available on TipaTale.",
    };
  }
}

const page = async () => {
  return <ChapterPage />;
};

export default page;