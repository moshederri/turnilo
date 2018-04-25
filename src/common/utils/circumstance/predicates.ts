/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2018 Allegro.pl
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { SplitCombine } from "../../models";
import { PredicateCircumstance } from "./circumstance-evaluator";
import { Predicate} from "./circumstance-evaluator-builder";

export class Predicates {
  public static noSplits(): Predicate {
    return ({ splits }) => splits.length() === 0;
  }

  private static testKind(kind: string, selector: string): boolean {
    if (selector === '*') {
      return true;
    }

    var bareSelector = selector.replace(/^!/, '');

    // This can be enriched later, right now it's just a 1-1 match
    var result = kind === bareSelector;

    if (selector.charAt(0) === '!') {
      return !result;
    }

    return result;
  }

  public static strictCompare(selectors: string[], kinds: string[]): boolean {
    if (selectors.length !== kinds.length) return false;

    return selectors.every((selector, i) => Predicates.testKind(kinds[i], selector));
  }

  public static areExactSplitKinds = (...selectors: string[]) => {
    return ({ splits, dataCube }: PredicateCircumstance): boolean => {
      var kinds: string[] = splits.toArray().map((split: SplitCombine) => split.getDimension(dataCube.dimensions).kind);
      return Predicates.strictCompare(selectors, kinds);
    };
  }

  public static haveAtLeastSplitKinds = (...kinds: string[]) => {
    return ({ splits, dataCube }: PredicateCircumstance): boolean => {
      let getKind = (split: SplitCombine) => split.getDimension(dataCube.dimensions).kind;

      let actualKinds = splits.toArray().map(getKind);

      return kinds.every((kind) => actualKinds.indexOf(kind) > -1);
    };
  }
}