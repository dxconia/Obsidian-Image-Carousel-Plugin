module.exports = class ImageCarouselPlugin extends require("obsidian").Plugin {
  async onload() {
    this.registerMarkdownCodeBlockProcessor("carousel", async (source, el, ctx) => {
      const lines = source.trim().split("\n").filter(line => line.trim() !== "");

      const container = document.createElement("div");
      container.className = "image-carousel-container";

      const wrapper = document.createElement("div");
      wrapper.className = "image-carousel-wrapper";

      const images = [];
      const imageSources = [];

      for (const line of lines) {
        const raw = line.trim();
        let img = document.createElement("img");
        img.className = "carousel-image";

        let filePath = raw;
        const match = raw.match(/^!\[\[(.+?)\]\]$/);
        if (match) {
          filePath = match[1];
        }

        const file = this.app.metadataCache.getFirstLinkpathDest(filePath, ctx.sourcePath);
        if (file) {
          const src = this.app.vault.getResourcePath(file);
          img.src = src;
          imageSources.push(src);
        } else {
          img.src = filePath;
          imageSources.push(filePath);
        }

        // 添加点击放大功能
        img.onclick = () => {
          const modal = document.createElement("div");
          modal.className = "image-modal";
          
          const modalContent = document.createElement("div");
          modalContent.className = "image-modal-content";
          
          const modalImg = document.createElement("img");
          modalImg.src = img.src;
          
          let currentIndex = imageSources.indexOf(img.src);
          
          // 添加左右箭头
          const leftArrow = document.createElement("div");
          leftArrow.className = "modal-arrow modal-left";
          leftArrow.innerText = "←";
          
          const rightArrow = document.createElement("div");
          rightArrow.className = "modal-arrow modal-right";
          rightArrow.innerText = "→";
          
          // 左右切换功能
          const showImage = (index) => {
            currentIndex = index;
            modalImg.src = imageSources[index];
          };
          
          leftArrow.onclick = (e) => {
            e.stopPropagation();
            const newIndex = (currentIndex - 1 + imageSources.length) % imageSources.length;
            showImage(newIndex);
          };
          
          rightArrow.onclick = (e) => {
            e.stopPropagation();
            const newIndex = (currentIndex + 1) % imageSources.length;
            showImage(newIndex);
          };

          // 点击图片关闭模态框
          modalImg.onclick = (e) => {
            e.stopPropagation();
            document.body.removeChild(modal);
          };
          
          modalContent.appendChild(modalImg);
          modalContent.appendChild(leftArrow);
          modalContent.appendChild(rightArrow);
          modal.appendChild(modalContent);
          document.body.appendChild(modal);
          
          // 点击模态框背景关闭
          const closeModal = () => {
            document.body.removeChild(modal);
          };
          
          modal.onclick = closeModal;
          modalContent.onclick = (e) => {
            e.stopPropagation();
          };
        };

        images.push(img);
        wrapper.appendChild(img);
      }

      // 滑动控制
      let scrollIndex = 0;
      const scrollToImage = (index) => {
        const width = container.offsetWidth;
        wrapper.scrollTo({ left: width * index, behavior: "smooth" });
      };

      const leftArrow = document.createElement("div");
      leftArrow.className = "carousel-arrow carousel-left";
      leftArrow.innerText = "<";
      leftArrow.onclick = () => {
        scrollIndex = Math.max(0, scrollIndex - 1);
        scrollToImage(scrollIndex);
      };

      const rightArrow = document.createElement("div");
      rightArrow.className = "carousel-arrow carousel-right";
      rightArrow.innerText = ">";
      rightArrow.onclick = () => {
        scrollIndex = Math.min(images.length - 1, scrollIndex + 1);
        scrollToImage(scrollIndex);
      };

      container.appendChild(wrapper);
      container.appendChild(leftArrow);
      container.appendChild(rightArrow);
      el.appendChild(container);
    });
  }
};
