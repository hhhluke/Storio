"use client";
import { useEffect, useState } from "react";
import { Snippet } from "@nextui-org/snippet";
import { Code } from "@nextui-org/code";
import { Icon } from "@iconify/react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  ScrollShadow,
  Select,
  SelectItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { cn } from "@nextui-org/theme";
import React from "react";

import { title } from "@/components/primitives";
const splitMarker = "\n====SPLIT CHAPTER====\n";
const fileList = [
  "example-1.txt",
  "example-2.txt",
  "example-3.txt",
  "example-4.txt",
  "example-5.txt",
];
const splitFile = (file: string) => {
  return file.split(/(?=^Chapter \d+ - )/gm).filter(Boolean);
}

const parseChapters = (text: string): { title: string; content: string }[] => {
  const regex = /^Chapter (.*)$([\s\S]*?)(?=^Chapter |^---CHAPTER END---|$(?![\s\S]))/gm;
  
  const chapters = [];
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    chapters.push({
      title: `Chapter ${match[1].trim()}`,
      content: match[2].trim()
    });
  }
  
  return chapters;
}

export default function Home() {
  const [fileContents, setFileContents] = useState<{ [key: string]: string }>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [chapters, setChapters] = useState<
    { title: string; content: string }[]
  >([]);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fileList.forEach((filename) => {
      fetch(`/input-txt/${filename}`)
        .then((res) => res.text())
        .then((text) => {
          setFileContents((prev) => ({ ...prev, [filename]: text }));
        });
    });
  }, []);

  useEffect(() => {
    if (!selected) return;
    setChapters(parseChapters(fileContents[selected]));
    setSelectedChapter(0);
  }, [selected]);

  useEffect(() => {
    if (selectedChapter != null && chapters[selectedChapter]) {
      setEditContent(chapters[selectedChapter].content);
    }
  }, [selectedChapter, chapters]);

  const insertSplitMarker = () => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = editContent.slice(0, start);
    const after = editContent.slice(end);
    const newValue = before + splitMarker + after;
    setEditContent(newValue);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + splitMarker.length;
    }, 0);
  };

  const handleSplit = () => {
    if (selectedChapter == null) return;
    const splits = editContent.split(/====SPLIT CHAPTER====\s*/g);
    const newChapters = [
      ...chapters.slice(0, selectedChapter),
      ...splits.map((content, idx) => ({
        title: idx === 0 ? chapters[selectedChapter].title : `${chapters[selectedChapter].title} (Part ${idx + 1})`,
        content: content.trim(),
      })),
      ...chapters.slice(selectedChapter + 1),
    ];
    setChapters(newChapters);
    setSelectedChapter(selectedChapter);
  };
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-xl text-center justify-center">
        <span className={title()}>Place your changes here</span>
      </div>
      <div className="mt-8 gap-16">
        <Snippet hideCopyButton hideSymbol className="gap-4" variant="bordered">
          <span>
            Get started by editing <Code color="primary">app/page.tsx</Code>
          </span>
          <span>Please feel free to use the example components below.</span>
        </Snippet>
      </div>
      <div className="pt-6 w-48">
        <Select
          items={fileList.map((filename) => ({
            key: filename,
            label: filename.replace(/\.txt$/, ""),
          }))}
          label="Story"
          placeholder="Select a story"
          onChange={(e) => setSelected(e.target.value)}
        >
          {(story) => <SelectItem key={story.key}>{story.label}</SelectItem>}
        </Select>
      </div>

      <div className="pt-6">
        <div className="flex flex-row ">
          <div
            className={cn(
              "relative flex h-full w-96 max-w-[384px] flex-1 flex-col !border-r-small border-divider pr-6 transition-[transform,opacity,margin] duration-250 ease-in-out",
            )}
            id="menu"
          >
            <header className="flex items-center text-md font-medium text-default-500 group-data-[selected=true]:text-foreground">
              <Icon
                className="text-default-500 mr-2"
                icon="solar:clipboard-text-outline"
                width={24}
              />
              Chapters
            </header>
            <ScrollShadow
              className="max-h-[calc(500px)] -mr-4"
              id="menu-scroll"
            >
              <div className="flex flex-col gap-4 py-3 pr-4">
              {chapters.map((chapter, idx) => (
                <Card
                  key={idx}
                  isPressable
                  className={`max-w-[384px] border-1 border-divider/15 ${selectedChapter === idx ? "bg-themeBlue/20" : ""}`}
                  shadow="none"
                  onPress={() => setSelectedChapter(idx)}
                >
                  <CardHeader className="flex items-center justify-between">
                    <div className="flex gap-1.5">
                      {selectedChapter === idx && (
                        <Chip
                        className="mr-1 text-themeBlue bg-themeBlue/20"
                        radius="sm"
                        size="sm"
                        variant="flat"
                      >
                        Editing
                      </Chip>)}
                      <p className="text-left mr-1">
                        {chapter.title}
                      </p>
                    </div>
                    <Dropdown>
                      <DropdownTrigger>
                          <Icon
                            icon="proicons:more"
                            width={24}
                          />
                      </DropdownTrigger>
                      <DropdownMenu aria-label="chapter actions">
                        <DropdownItem
                          key="merge"
                          onPress={e => {
                            if (idx < chapters.length - 1) {
                              const merged = {
                                title: chapter.title,
                                content: chapter.content + "\n" + chapters[idx + 1].content,
                              };
                              const newChapters = [
                                ...chapters.slice(0, idx),
                                merged,
                                ...chapters.slice(idx + 2),
                              ];
                              setChapters(newChapters);
                              setSelectedChapter(idx);
                            }
                          }}
                        >
                          Combine with next chapter
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </CardHeader>

                  <Divider />
                  <CardBody>
                    <p className="line-clamp-2">
                      {chapter.content}
                    </p>
                  </CardBody>
                </Card>
                ))}
              </div>
            </ScrollShadow>
          </div>

          <div className="w-full flex-1 flex-col min-w-[600px] pl-4">
            <div className="flex flex-col">
              <header className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <Button isIconOnly size="sm" variant="light">
                    <Icon
                      className="hideTooltip text-default-500"
                      height={24}
                      icon="solar:sidebar-minimalistic-outline"
                      width={24}
                    />
                  </Button>
                  {selectedChapter !== null && <h4 className="text-md">{chapters[selectedChapter]?.title}</h4>}
                </div>
              </header>
              <div className="w-full flex-1 flex-col min-w-[400px]">
                <div className={cn("flex flex-col gap-4")}>
                  <div className="flex flex-col items-start">
                    <div className="relative mb-5 w-full h-[400px] bg-slate-50 dark:bg-gray-800 rounded-lg">
                      <div className="absolute inset-x-4 top-4 z-10 flex justify-between items-center">
                        <div className="flex justify-between">
                          <Button
                            className="mr-2 bg-white dark:bg-gray-700"
                            size="sm"
                            startContent={
                              <Icon
                                className="text-default-500"
                                icon="ant-design:highlight-outlined"
                                width={24}
                              />
                            }
                            variant="flat"
                            onClick={insertSplitMarker}
                          >
                            Insert chapter split
                          </Button>
                        </div>

                        <Button
                          className="mr-2 bg-white dark:bg-gray-700"
                          size="sm"
                          startContent={
                            <Icon
                              className="text-default-500"
                              icon="material-symbols:save-outline"
                              width={24}
                            />
                          }
                          variant="flat"
                          onClick={handleSplit}
                        >
                          Split
                        </Button>
                      </div>
                      <div>
                        <ScrollShadow className="editScrollShow absolute left-2 right-2 bottom-10 top-12 text-base p-3 resize-none rounded-md border-solid border-inherit bg-slate-50 dark:bg-gray-800">
                          <div className="flex w-full h-full bg-slate-50 dark:bg-gray-200 rounded-lg p-2">
                            <textarea
                              ref={textareaRef}
                              className="flex-1 p-3 resize-none rounded-md border border-transparent bg-slate-50 dark:bg-gray-200 text-gray-900"
                              value={editContent}
                              onChange={e => setEditContent(e.target.value)}
                            />
                            <div className="bg-gray-100 p-1 rounded-md self-end ml-2">
                            </div>
                          </div>
                        </ScrollShadow>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
