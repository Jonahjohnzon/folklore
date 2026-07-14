import type { Metadata } from "next";
import { BookService } from "@/app/services/BookService";
import BookDetailPage from "./Body";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const { data } = await BookService.getBySlug(slug);
    const book = data.book;

    const title = book.title;
    const description = book.description
      ? book.description.slice(0, 155)
      : `Read ${book.title} by ${book.author.penName} on TipaTale.`;
    const url = `https://tipatale.com/book/${book.slug}`;
    const image = book.coverUrl || "/opengraph.png";

    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: {
        type: "book",
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
      title: "Book not found",
      description: "This book doesn't exist or isn't available on TipaTale.",
    };
  }
}

const page = async () => {
  return <BookDetailPage />;
};

export default page;