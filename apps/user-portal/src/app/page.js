'use client'
import axios from "axios";
import Image from "next/image";
import { useState, useEffect } from "react";
import Navbar from "@/components/common/Navbar";

export default function Home() {
  const [categories, setcategories] = useState([]);
  const [data, setdata] = useState(null);
  

  useEffect(() => {
    const homepageData = async () => {
      try {
        const response = await axios.get(`/api/v1/home`);
        console.log("Home page fetches :", response.data);
        setdata(response.data);
        setcategories(response.data.categories || []);
      } catch (err) {
        console.log("Error ::", err);
      }
    };
    homepageData();
  }, []);

  return (
    <div className="body">
      
      
      <section className="section1">
        <header className="section-header">
          <h3>Top Categories</h3>
          <a href="#">See all</a>
        </header>

        <div className="allCategories">
          {categories.length > 0 ? (

            categories.map((element, index) => (
              <div className="card1" key={element._id || index}>
                <Image 
                  fill 
                  src={element.thubnailsurl} 
                  alt={element.name} 
                  className="category-img"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <a href={`/category/${element.name}`}>
                  <h2>{element.name}</h2>
                </a>
              </div>  
            ))

          )  : (
            <div>NO Categories</div>
          )}

        </div>


      </section>

      <main className="main-content">
        <section className="section2">
          <header className="section-header">
            <h3>Top Movies</h3>
            <a href="#">See all</a>
          </header>

          <div className="movieContainer">
            <div className="movieCard">
              <Image 
              fill 
              src="/htmlphotos/Wallpapers.jpg" 
              alt="movieCard"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
               />
              <div className="text">
                <p>Details</p>
                <h4>Title Name</h4>
              </div>
              <a href="/movies/id"></a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}