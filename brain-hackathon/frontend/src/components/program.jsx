function About() {
  return (
    <div className="flex flex-col items-center p-32 gap-16 bg-swamp">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center w-[70vw] text-sm sm:text-lg md:text-xl">
        <div className="flex flex-col gap-8 text-white">
          <p>Har dere noensinne sett en John Deere 6125R parkert i en blackbox?</p>
          <p>Traktor tar leken på største alvor og elsker den musikalske kombinasjonen av søtt, salt og syrlig. Med andre ord, hva som kommer ut av Traktormaskineriet vet vi ikke, det er det som er så gøy.</p> 
          <p>For ensemblets musikere er Traktor et kollektiv og et kreativt laboratorium, et sted utenfor den vante boksen. Med et uhøytidelig alvor blandes sjangere like selvfølgelig som plogen vender jorda.</p>
          <p>Det ene øyeblikket synges det slagere fra mellomkrigstiden, eller er dette en performance? I det neste er det øyeblikk av pur skjønnhet eller samtidens kunst som tar all konsentrasjonen i rommet.</p>
          <p>Med en unik sound og formidling er Traktor noe helt for seg selv, det finnes ingen andre ensembler med en så rar og tøff besetning som bratsj, horn, bassklarinett, 2 pianoer og slagverk. Samtidig vil vi påstå at de har noe som passer for alle.</p>
        </div>
        <div>
          <img src="/notes.webp" className="rounded" />
          <img src="/img1.jpg" className="rounded" />
        </div>
        <img src="/img2.jpg" className="rounded" />
        <div className="flex flex-col gap-8 text-white">
          <p>Traktor etablerte seg som et samtidsmusikkensemble i 2011. Siden har de stått bak flere kritikerroste produksjoner.</p>
          <p>Sammensatt av klassiske musikere på svært høyt nivå, har Traktor produsert konserter og scenekunst med stort fokus på innovativ formidling, lekenhet og kvalitet.</p>
          <p>Bak produksjonene ligger ofte et langt arbeide i idé og konseptutvikling.</p>
          <p>Traktor har i sine produksjoner samarbeidet med komponistene Anna Berg, Jon Balke, Bjørn Bolstad Skjelbred, Ellen Lindquist, Geir Frode Stavsøien, Audun Kleive, Agnes Ida Pettersen, Stine Sørlie, Sven Lyder Kahrs, Eyolf Dale, Kaja Bjørntvedt, Trond Lindheim, Kristian Hernes, Nils Økland, Bjørn Andor Drage, Rune Rebne, Ludvig Elblaus, Isak Anderssen og Jon Øivind Ness.</p>
          <div className="flex flex-col gap-4">
            <span>Traktor består av:</span>
            <p className="text-gray-400">Johannes Skyberg - bratsj, Gunnar Flagstad - piano, Kristin Fyrand Mikkelsen - piano, Morten Kristiansen Jota - bassklarinett, Nora Hannisdal - horn, John Ivar Knutzen - slagverk</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About;
