const gallery = document.querySelector('.gallery__body');

if (gallery) {
  const galleryItems = document.querySelector('.gallery__items');
  const galleryColumn = document.querySelectorAll('.gallery__column');
  const speedAnimation = 0.3;
  let positionX = 0;
  let coordXprocent = 0;
  let galleryItemsWidth = 0;

  function setMouseGalleryStyle() {
    const galleryDifferent = galleryItemsWidth - gallery.offsetWidth;
    const distX = Math.floor(coordXprocent - positionX);
    positionX = positionX + (distX * speedAnimation);
    let position = galleryDifferent / 200 * positionX;

    galleryItems.style.cssText = `transform: translate(${-position}px,0);`;

    if(Math.abs(distX) > 0) {
      requestAnimationFrame(setMouseGalleryStyle);
    } else {
      gallery.classList.remove('_gallery');
    }
  }

  window.addEventListener('load', () => {
    galleryColumn.forEach(el => {
      galleryItemsWidth += el.offsetWidth;
    });
  })

  gallery.addEventListener("mousemove", e => {
    const galleryWidth = gallery.offsetWidth;
    const coordX = e.pageX - galleryWidth / 2;
    coordXprocent = coordX / galleryWidth * 200;

    if(!gallery.classList.contains('_gallery')) {
      requestAnimationFrame(setMouseGalleryStyle);
      gallery.classList.add('_gallery');
    }
  });
}

