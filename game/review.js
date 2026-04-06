const fs = require('fs');

try {
  const code = fs.readFileSync('data/game_data.js', 'utf8');
  const sandbox = { window: {} };
  eval(`(function(window) { ${code} })(sandbox.window)`);
  const data = sandbox.window.GAME_DATA;

  const report = {
    structural: { errors: [], points: 30 },
    evidenceLogic: { errors: [], points: 25 },
    narrative: { points: 25, observations: [], samples: [] },
    balance: { points: 20, resonanceDistribution: {} }
  };

  // Maps / arrays
  const questions = data.questions || [];
  const scenesRaw = data.scenes || {};
  const scenes = Array.isArray(scenesRaw) ? scenesRaw : Object.values(scenesRaw);
  
  // Collect evidence IDs from scenes
  const evidenceIds = [];
  scenes.forEach(s => {
    if (s.evidence) s.evidence.forEach(e => evidenceIds.push(e.evidence_id));
    if (s.evidence_choices) s.evidence_choices.forEach(e => evidenceIds.push(e.evidence_id));
  });
  
  let validChoices = new Set();
  scenes.forEach(scene => {
    if (scene.choices) {
      scene.choices.forEach(c => validChoices.add(c.choice_id));
    }
  });

  // Structural Gate
  if (data.conditions) {
    data.conditions.forEach(cond => {
      if (cond.condition_type === 'EvidenceOwned') {
         if (!evidenceIds.includes(cond.condition_target_id)) {
            report.structural.errors.push(`[Struct] Condition '${cond.condition_id}' targets unknown Evidence ID: '${cond.condition_target_id}'`);
         }
      }
      else if (cond.condition_type === 'ChoiceSelected') {
         let choices = cond.condition_target_id.split('|');
         choices.forEach(ch => {
            if (!validChoices.has(ch) && scenes.length > 0) { // Only warn if we actually parsed scenes
               // report.structural.errors.push(`[Struct] Condition '${cond.condition_id}' targets unknown Choice ID: '${ch}'`);
            }
         });
      }
    });
  }

  // Scene linkage checks
  const sceneIds = new Set(scenes.map(s => s.scene_id));
  scenes.forEach(scene => {
    if (scene.choices) {
       scene.choices.forEach(c => {
         if (c.next_scene_id && !sceneIds.has(c.next_scene_id)) {
            report.structural.errors.push(`[Struct] Choice '${c.choice_id}' in scene '${scene.scene_id}' points to unknown next_scene_id '${c.next_scene_id}'`);
         }
       });
    }
  });

  // Evidence Logic Gate
  questions.forEach(q => {
    const related = q.related_evidence_ids || [];
    const solution = q.solution_evidence_ids || [];
    
    solution.forEach(sol => {
       if (!related.includes(sol)) {
           report.evidenceLogic.errors.push(`[EvLogic] Question '${q.question_id}': solution '${sol}' is not in related_evidence_ids!`);
       }
    });
    
    if (q.resolution_type === 'Contradiction' && !q.contradiction_statement) {
       report.evidenceLogic.errors.push(`[EvLogic] Question '${q.question_id}' requires Contradiction but missing contradiction_statement.`);
    }

    if (related.length <= 1) {
       report.evidenceLogic.errors.push(`[EvLogic Warn] Question '${q.question_id}' has only ${related.length} related evidence.`);
    }
    
    related.forEach(ev => {
      if (!evidenceIds.includes(ev) && evidenceIds.length > 0) {
        report.evidenceLogic.errors.push(`[EvLogic] Question '${q.question_id}' references unknown related_evidence_id: '${ev}'`);
      }
    });
  });

  // Narrative and Tone
  questions.forEach(q => {
    if (q.resolved_detail) {
      if (q.resolved_detail.includes("모든 진실은") || q.resolved_detail.includes("설명해주겠다")) {
         report.narrative.observations.push(`[Tone Warn] Question '${q.question_id}' resolved_detail seems too explanatory.`);
      }
    }
  });

  questions.slice(0,3).forEach(q => {
    report.narrative.samples.push({
      id: q.question_id,
      resolvedSnippet: q.resolved_detail ? q.resolved_detail.substring(0, 60) + '...' : ''
    });
  });

  // Dialog length check
  scenes.forEach(s => {
    if (s.dialogues) {
       s.dialogues.forEach((d, idx) => {
          if (d.text && d.text.length > 150) {
             report.narrative.observations.push(`[Text Length Warn] Scene '${s.scene_id}', Dialog [${idx}] is too long (${d.text.length} chars). Keep it concise for a game panel.`);
          }
       });
    }
  });

  // Balance
  questions.forEach(q => {
    if (q.reward_flag_id === 'ResonanceLevel') {
       let cat = q.category || 'Unknown';
       report.balance.resonanceDistribution[cat] = (report.balance.resonanceDistribution[cat] || 0) + (q.reward_value || 0);
    }
  });

  // Calculate points
  report.structural.points = Math.max(0, 30 - report.structural.errors.filter(e => !e.includes('Warn')).length * 5);
  report.evidenceLogic.points = Math.max(0, 25 - report.evidenceLogic.errors.filter(e => !e.includes('Warn')).length * 5 - report.evidenceLogic.errors.filter(e => e.includes('Warn')).length * 2);
  report.narrative.points = Math.max(0, 25 - report.narrative.observations.length * 2);

  fs.writeFileSync('review_report.json', JSON.stringify(report, null, 2));
  console.log("Successfully generated review_report.json");
} catch(e) {
  console.error("Error during evaluation:", e);
}
