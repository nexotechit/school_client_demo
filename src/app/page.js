import Image from "next/image";
import Hero from "../../components/Hero/Hero";
import Notice from "../../components/Notice/Notice";
import Facilities from "../../components/Facilities/Facilities";
import Academics from "../../components/Academics/Academics";
import Achievements from "../../components/Achievements/Achievements";
import Gallery from "../../components/Gallery/Gallery";


export default function Home() {
  return (
   <div >
    <Hero></Hero>
    <Notice></Notice>
    <Facilities></Facilities>
    <Academics></Academics>
    <Achievements></Achievements>
    <Gallery></Gallery>
   </div>
  );
}
