// ----------------------------------------------------------------------
// RuleChain base class
// In contrast to Halcyon, note that length() is a function, not a getter property

/**	A descendant list of MapCSS selectors (Rules).

  For example,
  relation[type=route] way[highway=primary]
  ^^^^^^^^^^^^^^^^^^^^ ^^^^^^^^^^^^^^^^^^^^
  first Rule           second Rule
  |------------|---------|
  |
  one RuleChain

*/

import styleparser from "./Style";

styleparser.RuleChain = function () {
  this.rules = []; // list of Rules
  this.subpart = "default"; // subpart name, as in way[highway=primary]::centreline
};
styleparser.RuleChain.prototype = {
  // Functions to define the RuleChain
  addRule(_subject) {
    this.rules.push(new styleparser.Rule());
    this.rules[this.rules.length - 1].addSubject(_subject);
  },

  addConditionToLast(_condition) {
    this.rules[this.rules.length - 1].addCondition(_condition);
  },

  addZoomToLast(z1, z2) {
    this.rules[this.rules.length - 1].minZoom = z1;
    this.rules[this.rules.length - 1].maxZoom = z2;
  },

  length() {
    return this.rules.length;
  },

  setSubpart(subpart) {
    this.subpart = subpart || "default";
  },

  // Test a ruleChain
  // - run a set of tests in the chain
  //		works backwards from at position "pos" in array, or -1  for the last
  //		separate tags object is required in case they've been dynamically retagged
  // - if they fail, return false
  // - if they succeed, and it's the last in the chain, return happily
  // - if they succeed, and there's more in the chain, rerun this for each parent until success

  test(pos, entity, tags, zoom) {
    // summary:		Test a rule chain by running all the tests in reverse order.
    if (this.rules.length === 0) {
      return true;
    } // orig: { return false; } // todo: wildcard selector "*" semms broken...
    if (pos == -1) {
      pos = this.rules.length - 1;
    }

    let r = this.rules[pos];
    if (!r.test(entity, tags, zoom)) {
      return false;
    }
    if (pos === 0) {
      return true;
    }

    let o = entity.getParentObjects(); //TODO//entity.entity.parentObjects();
    for (let p of o) {
      if (this.test(pos - 1, p, p.tags, zoom)) {
        return true;
      }
    }
    return false;
  }
};
