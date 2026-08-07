import { SearchForm } from "@/components/search-form";

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="text-2xl font-bold">
            laRooms
          </a>
          <nav className="flex gap-4 text-sm">
            <a href="/" className="text-muted-foreground hover:text-foreground">
              Поиск
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-primary/5 to-background py-16 md:py-24">
          <div className="container mx-auto px-4 text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Найдите идеальный отель
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Бронируйте отели по выгодным ценам. Thousands отелей по всей России и за рубежом.
            </p>
          </div>
          <SearchForm />
        </section>

        {/* Features */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="font-semibold mb-2">Умный поиск</h3>
              <p className="text-sm text-muted-foreground">
                Находите отели по фильтрам: звёзды, питание, удобства, рейтинг и цена
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="font-semibold mb-2">Лучшие цены</h3>
              <p className="text-sm text-muted-foreground">
                Сравнивайте цены и находите предложения со скидками
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="font-semibold mb-2">Отзывы реальных гостей</h3>
              <p className="text-sm text-muted-foreground">
                Читайте отзывы и смотрите рейтинги перед бронированием
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          laRooms © {new Date().getFullYear()} · Бронирование отелей
        </div>
      </footer>
    </div>
  );
}
