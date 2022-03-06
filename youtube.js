  const puppeteer = require("puppeteer");
  const pdf = require("pdfkit");
  const fs = require("fs");
const { end } = require("pdfkit");
  let url = "https://youtube.com/playlist?list=PL9bw4S5ePsEFSSvWQ2ukqHoxC4YvN4gsJ";
  let cTab;

  (async function(){
      try {
          let browserOpen = puppeteer.launch({
              headless: false,
              defaultViewport: null,
              args: ['--start-maximized']
          })
          let browserIstance = await browserOpen;
          let allTAbsArr = await browserIstance.pages();
          cTab = allTAbsArr[0];
          await cTab.goto(url);
          await cTab.waitForSelector("h1#title");
          let name = await cTab.evaluate(function(select){return document.querySelector(select).innerText} , "h1#title");

          
          let allData = await cTab.evaluate(getData ,"#stats .style-scope.ytd-playlist-sidebar-primary-info-renderer" )
          console.log(name , allData.noOfVideos ,allData.noOfviews);
          let totalVideos = allData.noOfVideos.split(" ")[0];
          console.log(totalVideos);
          let CurrentVideos = await getCVideos();
          console.log(CurrentVideos);

          while(totalVideos-CurrentVideos >= 20){
            await scrollToBottom();
            CurrentVideos = await getCVideos();
          }

          let finalList = await  getStats();
          let pdfDoc = new pdf;
          pdfDoc.pipe(fs.createWriteStream("play.pdf"));
          pdfDoc.text (JSON.stringify(finalList));
          pdfDoc.end();
      } catch (error){
          console.log(error);
      }
  })();

  function getData(selector){
      let allElems = document.querySelectorAll(selector);
      let noOfVideos =allElems[0].innerText;
      let noOfviews = allElems[1].innerText;

      return{
          noOfVideos,
          noOfviews
      }
  }

  async function getCVideos(){
      let length = await cTab.evaluate(getLength,"#container>#thumbnail span.style-scope.ytd-thumbnail-overlay-time-status-renderer" );
      return length;
  }


  async function scrollToBottom(){
      await cTab.evaluate(gotoBottom)
      function gotoBottom(){
          window.scrollBy(0 , innerHeight);
      }
  }

  async function getStats(){
      let list = cTab.evaluate(getNAmeAndDuration , "#video-title", "#container>#thumbnail span.style-scope.ytd-thumbnail-overlay-time-status-renderer");
      return list;
  } 


  function getLength(durationSelect){
      let duratioEle = document.querySelectorAll(durationSelect);
      return duratioEle.length;
  }

  function getNAmeAndDuration(videoSelector , durationSelector){
      let videoElem = document.querySelectorAll(videoSelector);
      let duratioEle = document.querySelectorAll(durationSelector);

      let currentList = [];

      for(let i=0 ; i<duratioEle.length ; i++){
          let videoTitle = videoElem[i].innerText
          let duration = duratioEle[i].innerText
          currentList.push({videoTitle , duration});
      }
      return currentList;
  }