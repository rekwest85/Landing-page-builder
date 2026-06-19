"use client";

import * as React from "react";
import { useEditorStore } from "@/stores/editor";
import { BLOCK_DEFINITIONS, type Block, type BlockType } from "@/lib/blocks/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function PropertyPanel() {
  const blocks = useEditorStore((s) => s.blocks);
  const selectedId = useEditorStore((s) => s.selectedBlockId);
  const updateBlockProps = useEditorStore((s) => s.updateBlockProps);
  const setAiGenerating = useEditorStore((s) => s.setAiGenerating);
  const setRightPanelTab = useEditorStore((s) => s.setRightPanelTab);

  const block = blocks.find((b) => b.id === selectedId);

  if (!block) {
    return (
      <div className="p-6 text-center">
        <div className="text-sm text-white/40">
          Select a block to edit its properties
        </div>
      </div>
    );
  }

  const def = BLOCK_DEFINITIONS[block.type];
  if (!def) return null;

  async function regenerateWithAI() {
    if (!block) return;
    setAiGenerating(true);
    try {
      const res = await fetch("/api/ai/regenerate-block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: block.type, props: block.props }),
      });
      const data = await res.json();
      if (data.props) updateBlockProps(block.id, data.props);
    } catch (err) {
      console.error(err);
    } finally {
      setAiGenerating(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Block header */}
      <div className="p-4 border-b border-white/[0.06]">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-white/40 uppercase tracking-wider font-medium">
            {def.category}
          </span>
          <button
            onClick={() => setRightPanelTab("ai")}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-medium bg-violet-500/10 border border-violet-500/20 text-violet-200 hover:bg-violet-500/20 transition-colors"
          >
            <Sparkles className="h-3 w-3" />
            AI assist
          </button>
        </div>
        <h3 className="text-base font-semibold text-white">{def.label}</h3>
        <p className="text-xs text-white/50 mt-0.5">{def.description}</p>
      </div>

      {/* Block-specific fields */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.entries(def.defaultProps ?? {}).map(([key, defaultValue]) => (
          <FieldEditor
            key={key}
            fieldKey={key}
            value={block.props[key]}
            defaultValue={defaultValue}
            onChange={(v) => updateBlockProps(block.id, { [key]: v })}
          />
        ))}
      </div>

      {/* Regenerate button */}
      <div className="p-4 border-t border-white/[0.06]">
        <Button
          variant="primary"
          className="w-full"
          onClick={regenerateWithAI}
          disabled={false}
        >
          <Sparkles className="h-4 w-4" />
          Regenerate with AI
        </Button>
      </div>
    </div>
  );
}

function FieldEditor({
  fieldKey,
  value,
  defaultValue,
  onChange,
}: {
  fieldKey: string;
  value: any;
  defaultValue: any;
  onChange: (v: any) => void;
}) {
  const label = humanize(fieldKey);

  // Array fields
  if (Array.isArray(defaultValue)) {
    return (
      <ArrayField
        label={label}
        value={value ?? []}
        onChange={onChange}
        itemTemplate={defaultValue[0]}
      />
    );
  }

  // Boolean fields
  if (typeof defaultValue === "boolean") {
    return (
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-white/70">{label}</label>
        <button
          onClick={() => onChange(!value)}
          className={cn(
            "relative h-5 w-9 rounded-full transition-colors",
            value ? "bg-violet-500" : "bg-white/[0.08]"
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all",
              value ? "left-4" : "left-0.5"
            )}
          />
        </button>
      </div>
    );
  }

  // Long text fields
  if (typeof defaultValue === "string" && defaultValue.length > 80) {
    return (
      <div>
        <label className="block text-xs font-medium text-white/70 mb-1.5">{label}</label>
        <Textarea
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
        />
      </div>
    );
  }

  // Color/URL/image fields
  if (
    typeof defaultValue === "string" &&
    (fieldKey.includes("url") ||
      fieldKey.includes("Url") ||
      fieldKey.includes("image") ||
      fieldKey.includes("src") ||
      fieldKey === "avatar" ||
      fieldKey === "logo")
  ) {
    return (
      <div>
        <label className="block text-xs font-medium text-white/70 mb-1.5">{label}</label>
        <Input
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://…"
        />
      </div>
    );
  }

  // Select (alignment)
  if (fieldKey === "align" || fieldKey === "columns") {
    const options =
      fieldKey === "align"
        ? ["left", "center", "right"]
        : fieldKey === "columns"
          ? [2, 3, 4]
          : [];
    return (
      <div>
        <label className="block text-xs font-medium text-white/70 mb-1.5">{label}</label>
        <div className="grid grid-cols-3 gap-1">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className={cn(
                "h-8 rounded-md text-xs font-medium border transition-all",
                value === opt
                  ? "bg-violet-500/20 border-violet-500/40 text-violet-100"
                  : "bg-white/[0.02] border-white/[0.06] text-white/60 hover:bg-white/[0.05]"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Default text input
  return (
    <div>
      <label className="block text-xs font-medium text-white/70 mb-1.5">{label}</label>
      <Input
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function ArrayField({
  label,
  value,
  onChange,
  itemTemplate,
}: {
  label: string;
  value: any[];
  onChange: (v: any[]) => void;
  itemTemplate: any;
}) {
  function add() {
    onChange([...value, JSON.parse(JSON.stringify(itemTemplate ?? {}))]);
  }
  function update(i: number, v: any) {
    const next = [...value];
    next[i] = v;
    onChange(next);
  }
  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-medium text-white/70">{label}</label>
        <button
          onClick={add}
          className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium bg-white/[0.04] hover:bg-white/[0.08] text-white/70"
        >
          <Plus className="h-3 w-3" />
          Add
        </button>
      </div>
      <div className="space-y-2">
        {value.map((item, i) => (
          <div
            key={i}
            className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 space-y-1.5"
          >
            {typeof item === "object" && item !== null ? (
              Object.entries(item).map(([k, v]) => (
                <div key={k}>
                  <label className="block text-[10px] text-white/50 mb-0.5">
                    {humanize(k)}
                  </label>
                  {typeof v === "string" && v.length > 60 ? (
                    <Textarea
                      value={v}
                      onChange={(e) => update(i, { ...item, [k]: e.target.value })}
                      rows={2}
                      className="text-xs"
                    />
                  ) : (
                    <Input
                      value={typeof item === "string" ? item : ""}
                      onChange={(e) => update(i, e.target.value)}
                      className="h-7 text-xs"
                    />
                  )}
                </div>
              ))
            ) : (
              <Input
                value={item ?? ""}
                onChange={(e) => update(i, e.target.value)}
                className="h-7 text-xs"
              />
            )}
            <button
              onClick={() => remove(i)}
              className="inline-flex items-center gap-1 text-[10px] text-red-300/70 hover:text-red-300 mt-1"
            >
              <Trash2 className="h-3 w-3" />
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function humanize(s: string): string {
  return s
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}
